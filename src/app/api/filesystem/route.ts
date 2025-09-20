import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Define workspace root (configurable per user/project)
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || '/data/workspace';

// Security: Ensure all paths are within workspace
function isPathSafe(requestedPath: string): boolean {
  const normalizedPath = path.normalize(requestedPath);
  const resolvedPath = path.resolve(WORKSPACE_ROOT, normalizedPath);
  return resolvedPath.startsWith(path.resolve(WORKSPACE_ROOT));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path') || '/';
    const action = searchParams.get('action') || 'list';

    // Validate path security
    if (!isPathSafe(filePath)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 403 }
      );
    }

    const fullPath = path.join(WORKSPACE_ROOT, filePath);

    if (action === 'read') {
      // Read file content
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        return NextResponse.json({
          success: true,
          path: filePath,
          content,
          encoding: 'utf-8'
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'File not found or cannot be read' },
          { status: 404 }
        );
      }
    }

    if (action === 'list') {
      // List directory contents
      try {
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          const items = await fs.readdir(fullPath, { withFileTypes: true });
          const fileList = await Promise.all(
            items.map(async (item) => {
              const itemPath = path.join(fullPath, item.name);
              const itemStats = await fs.stat(itemPath);

              return {
                name: item.name,
                path: path.join(filePath, item.name),
                type: item.isDirectory() ? 'directory' : 'file',
                size: itemStats.size,
                modified: itemStats.mtime,
                created: itemStats.ctime
              };
            })
          );

          return NextResponse.json({
            success: true,
            path: filePath,
            items: fileList.sort((a, b) => {
              // Directories first, then files
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'directory' ? -1 : 1;
            })
          });
        } else {
          // If it's a file, return file info
          return NextResponse.json({
            success: true,
            path: filePath,
            type: 'file',
            size: stats.size,
            modified: stats.mtime,
            created: stats.ctime
          });
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Path not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Filesystem API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: filePath, content, action } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Validate path security
    if (!isPathSafe(filePath)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 403 }
      );
    }

    const fullPath = path.join(WORKSPACE_ROOT, filePath);

    if (action === 'write' || action === 'create') {
      // Write/create file
      if (!content && content !== '') {
        return NextResponse.json(
          { error: 'Content is required for write action' },
          { status: 400 }
        );
      }

      try {
        // Ensure directory exists
        const dir = path.dirname(fullPath);
        await fs.mkdir(dir, { recursive: true });

        // Write file
        await fs.writeFile(fullPath, content, 'utf-8');

        return NextResponse.json({
          success: true,
          message: 'File saved successfully',
          path: filePath
        });
      } catch (error) {
        console.error('Write error:', error);
        return NextResponse.json(
          { error: 'Failed to write file' },
          { status: 500 }
        );
      }
    }

    if (action === 'mkdir') {
      // Create directory
      try {
        await fs.mkdir(fullPath, { recursive: true });
        return NextResponse.json({
          success: true,
          message: 'Directory created successfully',
          path: filePath
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to create directory' },
          { status: 500 }
        );
      }
    }

    if (action === 'delete') {
      // Delete file or directory
      try {
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          await fs.rmdir(fullPath, { recursive: true });
        } else {
          await fs.unlink(fullPath);
        }

        return NextResponse.json({
          success: true,
          message: 'Deleted successfully',
          path: filePath
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to delete' },
          { status: 500 }
        );
      }
    }

    if (action === 'rename' || action === 'move') {
      const { newPath } = body;

      if (!newPath) {
        return NextResponse.json(
          { error: 'New path is required' },
          { status: 400 }
        );
      }

      if (!isPathSafe(newPath)) {
        return NextResponse.json(
          { error: 'Invalid new path' },
          { status: 403 }
        );
      }

      const newFullPath = path.join(WORKSPACE_ROOT, newPath);

      try {
        // Ensure target directory exists
        const newDir = path.dirname(newFullPath);
        await fs.mkdir(newDir, { recursive: true });

        // Rename/move
        await fs.rename(fullPath, newFullPath);

        return NextResponse.json({
          success: true,
          message: 'Renamed successfully',
          oldPath: filePath,
          newPath: newPath
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to rename' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Filesystem API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Handle file uploads
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetPath = formData.get('path') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!targetPath || !isPathSafe(targetPath)) {
      return NextResponse.json(
        { error: 'Invalid target path' },
        { status: 403 }
      );
    }

    const fullPath = path.join(WORKSPACE_ROOT, targetPath, file.name);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(fullPath, buffer);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      path: path.join(targetPath, file.name),
      size: buffer.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}