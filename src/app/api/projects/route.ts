import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  language: z.string().optional(),
  framework: z.string().optional(),
  repository: z.string().url().optional(),
  isPublic: z.boolean().default(false),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    language: z.string().optional(),
  })).optional(),
});

// GET /api/projects - List user's projects
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // For now, we'll return farms as projects (since they're in the schema)
    // In a real implementation, you'd have a dedicated Project model
    const projects = await prisma.farm.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        location: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            fields: true,
            batches: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform farms to project format
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.location,
      language: (project.metadata as any)?.language || "TypeScript",
      framework: (project.metadata as any)?.framework || "Next.js",
      filesCount: project._count.fields,
      lastModified: project.updatedAt,
      createdAt: project.createdAt,
      size: Math.round(Math.random() * 20 * 1024 * 1024), // Mock size in bytes
      isPublic: (project.metadata as any)?.isPublic || false,
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createProjectSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, usageQuota: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check project limits
    const projectCount = await prisma.farm.count({
      where: { ownerId: user.id },
    });

    const maxProjects = user.usageQuota?.privateReposLimit || 3;
    if (maxProjects !== -1 && projectCount >= maxProjects) {
      return NextResponse.json(
        { error: `Project limit reached. Maximum ${maxProjects} projects allowed.` },
        { status: 400 }
      );
    }

    // Create project (using Farm model for now)
    const project = await prisma.farm.create({
      data: {
        name: validatedData.name,
        ownerId: user.id,
        location: validatedData.description,
        metadata: {
          language: validatedData.language,
          framework: validatedData.framework,
          repository: validatedData.repository,
          isPublic: validatedData.isPublic,
          files: validatedData.files || [],
        },
      },
    });

    // Track usage
    if (user.usageQuota) {
      await prisma.usageQuota.update({
        where: { id: user.usageQuota.id },
        data: {
          storageUsedGB: {
            increment: 0.001, // Add small amount for new project
          },
        },
      });
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.location,
      createdAt: project.createdAt,
      message: "Project created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id] - Get a specific project
export async function getProject(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const project = await prisma.farm.findFirst({
      where: {
        id: params.id,
        ownerId: user.id,
      },
      include: {
        fields: true, // Files/components of the project
        batches: true, // Versions/commits
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.location,
      metadata: project.metadata,
      files: project.fields.map(field => ({
        id: field.id,
        name: field.name,
        status: field.status,
        metadata: field.metadata,
      })),
      versions: project.batches.map(batch => ({
        id: batch.id,
        code: batch.batchCode,
        status: batch.status,
        createdAt: batch.createdAt,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function updateProject(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, metadata, files } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const project = await prisma.farm.findFirst({
      where: {
        id: params.id,
        ownerId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Update project
    const updatedProject = await prisma.farm.update({
      where: { id: params.id },
      data: {
        name: name || project.name,
        location: description || project.location,
        metadata: {
          ...(project.metadata as any),
          ...metadata,
          files: files || (project.metadata as any)?.files,
        },
      },
    });

    return NextResponse.json({
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.location,
      metadata: updatedProject.metadata,
      updatedAt: updatedProject.updatedAt,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function deleteProject(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const project = await prisma.farm.findFirst({
      where: {
        id: params.id,
        ownerId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Delete project
    await prisma.farm.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}