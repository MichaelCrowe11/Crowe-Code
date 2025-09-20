"""
Modal deployment configuration for CroweCode Platform
"""
import modal
import os
from pathlib import Path

# Create Modal app
app = modal.App("crowecode-platform")

# Define the Docker image with all dependencies
crowecode_image = (
    modal.Image.from_dockerfile("./Dockerfile")
    .add_local_dir("./src", remote_path="/app/src")
    .add_local_dir("./public", remote_path="/app/public")
    .add_local_file("./package.json", remote_path="/app/package.json")
    .add_local_file("./package-lock.json", remote_path="/app/package-lock.json")
    .add_local_file("./next.config.js", remote_path="/app/next.config.js")
    .add_local_file("./tsconfig.json", remote_path="/app/tsconfig.json")
    .add_local_dir("./prisma", remote_path="/app/prisma")
    .env({
        "NODE_ENV": "production",
        "PORT": "3000",
        "HOSTNAME": "0.0.0.0"
    })
)

# Create secrets for environment variables
secrets = [
    modal.Secret.from_name("crowecode-database"),
    modal.Secret.from_name("crowecode-auth"),
    modal.Secret.from_name("crowecode-ai"),
    modal.Secret.from_name("crowecode-stripe"),
]

# Web server function
@app.function(
    image=crowecode_image,
    secrets=secrets,
    cpu=2,
    memory=4096,
    container_idle_timeout=300,
    allow_concurrent_inputs=100,
)
@modal.web_endpoint(method="GET", label="crowecode-main")
def web_server():
    """Main web server endpoint"""
    import subprocess
    import sys

    # Run database migrations
    subprocess.run(["npx", "prisma", "migrate", "deploy"], check=True)

    # Start the Next.js server
    process = subprocess.Popen(
        ["npm", "start"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Stream logs
    for line in process.stdout:
        print(line, end='')

    return {"status": "running", "url": "https://crowecode-platform.modal.run"}

# AI processing function for heavy workloads
@app.function(
    image=crowecode_image,
    secrets=secrets,
    gpu="T4",  # Use GPU for AI tasks
    memory=8192,
    timeout=600,
)
def ai_processor(prompt: str, mode: str = "code_generation"):
    """
    Process AI requests on Modal's GPU infrastructure
    """
    from src.lib.ai_provider import aiProviderManager

    result = aiProviderManager.executeWithFallback(
        {"prompt": prompt},
        mode
    )

    return result

# Background job processor
@app.function(
    image=crowecode_image,
    secrets=secrets,
    cpu=1,
    memory=2048,
    schedule=modal.Period(minutes=5),  # Run every 5 minutes
)
def background_jobs():
    """
    Process background jobs and maintenance tasks
    """
    import subprocess

    # Clean up old sessions
    subprocess.run(["node", "scripts/cleanup-sessions.js"], check=True)

    # Process queued AI tasks
    subprocess.run(["node", "scripts/process-ai-queue.js"], check=True)

    return {"status": "completed", "timestamp": os.environ.get("MODAL_TASK_ID")}

# WebSocket handler for real-time features
@app.function(
    image=crowecode_image,
    secrets=secrets,
    cpu=1,
    memory=2048,
    container_idle_timeout=600,
)
@modal.asgi_app()
def websocket_server():
    """
    WebSocket server for real-time collaboration
    """
    from fastapi import FastAPI, WebSocket
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI()

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        while True:
            data = await websocket.receive_text()
            # Process WebSocket data
            await websocket.send_text(f"Echo: {data}")

    return app

# Local development server (for testing)
@app.local_entrypoint()
def main():
    """
    Entry point for local development
    """
    print("CroweCode Platform - Modal Deployment")
    print("=====================================")
    print("Deployed endpoints:")
    print("- Web: https://crowecode-platform.modal.run")
    print("- WebSocket: wss://crowecode-platform-ws.modal.run")
    print("- AI Processor: Available via Modal API")
    print("\nTo deploy: modal deploy modal_app.py")
    print("To run locally: modal run modal_app.py")

if __name__ == "__main__":
    main()