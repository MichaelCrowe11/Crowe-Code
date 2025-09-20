'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit2 } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FileTreeProps {
  onFileSelect?: (path: string) => void;
  onFileCreate?: (path: string) => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
}

export default function FileTree({
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename
}: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  // Load initial file tree
  useEffect(() => {
    loadDirectory('/');
  }, []);

  const loadDirectory = async (dirPath: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/filesystem?path=${encodeURIComponent(dirPath)}&action=list`);

      if (!response.ok) {
        throw new Error('Failed to load directory');
      }

      const data = await response.json();

      if (data.success && data.items) {
        // If this is the root, set the whole tree
        if (dirPath === '/') {
          const rootItems = data.items.map((item: any) => ({
            ...item,
            children: item.type === 'directory' ? [] : undefined,
            isExpanded: false
          }));
          setTree(rootItems);
        } else {
          // Otherwise, update the specific node in the tree
          setTree(prevTree => updateNodeInTree(prevTree, dirPath, data.items));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      console.error('Error loading directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateNodeInTree = (nodes: FileNode[], targetPath: string, newChildren: any[]): FileNode[] => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return {
          ...node,
          children: newChildren.map((item: any) => ({
            ...item,
            children: item.type === 'directory' ? [] : undefined,
            isExpanded: false
          })),
          isExpanded: true
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateNodeInTree(node.children, targetPath, newChildren)
        };
      }
      return node;
    });
  };

  const toggleDirectory = (node: FileNode) => {
    if (node.type !== 'directory') return;

    if (!node.isExpanded && (!node.children || node.children.length === 0)) {
      // Load children if not loaded
      loadDirectory(node.path);
    } else {
      // Just toggle expansion
      setTree(prevTree => toggleNodeInTree(prevTree, node.path));
    }
  };

  const toggleNodeInTree = (nodes: FileNode[], targetPath: string): FileNode[] => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return { ...node, isExpanded: !node.isExpanded };
      }
      if (node.children) {
        return {
          ...node,
          children: toggleNodeInTree(node.children, targetPath)
        };
      }
      return node;
    });
  };

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'file') {
      setSelectedPath(node.path);
      onFileSelect?.(node.path);
    } else {
      toggleDirectory(node);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, path: node.path });
  };

  const handleCreateFile = async (dirPath: string) => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const filePath = `${dirPath}/${fileName}`.replace('//', '/');

    try {
      const response = await fetch('/api/filesystem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: filePath,
          content: '',
          action: 'create'
        })
      });

      if (response.ok) {
        onFileCreate?.(filePath);
        loadDirectory(dirPath);
      } else {
        throw new Error('Failed to create file');
      }
    } catch (err) {
      console.error('Error creating file:', err);
      alert('Failed to create file');
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm(`Delete ${path}?`)) return;

    try {
      const response = await fetch('/api/filesystem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          action: 'delete'
        })
      });

      if (response.ok) {
        onFileDelete?.(path);
        loadDirectory('/');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete');
    }
  };

  const handleRename = async (oldPath: string) => {
    if (!newName) return;

    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');

    try {
      const response = await fetch('/api/filesystem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: oldPath,
          newPath,
          action: 'rename'
        })
      });

      if (response.ok) {
        onFileRename?.(oldPath, newPath);
        setRenaming(null);
        setNewName('');
        loadDirectory('/');
      } else {
        throw new Error('Failed to rename');
      }
    } catch (err) {
      console.error('Error renaming:', err);
      alert('Failed to rename');
    }
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isSelected = selectedPath === node.path;
    const isRenaming = renaming === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer select-none ${
            isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          {node.type === 'directory' ? (
            <>
              {node.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              {node.isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
            </>
          ) : (
            <>
              <span className="w-4" />
              <File size={16} />
            </>
          )}

          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => handleRename(node.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(node.path);
                if (e.key === 'Escape') {
                  setRenaming(null);
                  setNewName('');
                }
              }}
              className="ml-1 px-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="ml-1 text-sm truncate">{node.name}</span>
          )}
        </div>

        {node.type === 'directory' && node.isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
        <span className="text-sm font-medium">Files</span>
        <button
          onClick={() => handleCreateFile('/')}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="New File"
        >
          <Plus size={16} />
        </button>
      </div>

      {loading && (
        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
      )}

      {error && (
        <div className="p-4 text-center text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && tree.length === 0 && (
        <div className="p-4 text-center text-sm text-gray-500">No files</div>
      )}

      {!loading && !error && tree.length > 0 && (
        <div className="py-2">
          {tree.map(node => renderNode(node))}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => {
                const node = findNodeByPath(tree, contextMenu.path);
                if (node) {
                  setRenaming(contextMenu.path);
                  setNewName(node.name);
                }
                setContextMenu(null);
              }}
            >
              <Edit2 size={14} />
              Rename
            </button>
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
              onClick={() => {
                handleDelete(contextMenu.path);
                setContextMenu(null);
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function findNodeByPath(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}