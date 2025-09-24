"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronRight, Play, Save, Download, Upload, Plus, Trash2, Code, Database, Cloud, Settings, Cpu, GitBranch, Package, Terminal, Zap, Eye, Copy, RefreshCw, Layers, Box, Grid3x3, Move, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import logger from '../../lib/logger';

// Node Types
type NodeType = 'function' | 'variable' | 'condition' | 'loop' | 'api' | 'database' | 'transform' | 'output' | 'input' | 'ai';

interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  data: any;
  inputs: string[];
  outputs: string[];
  code?: string;
  color: string;
}

interface Connection {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

interface NodeTemplate {
  type: NodeType;
  label: string;
  icon: React.ElementType;
  color: string;
  defaultCode: string;
  inputs: number;
  outputs: number;
}

const nodeTemplates: NodeTemplate[] = [
  { type: 'function', label: 'Function', icon: Code, color: 'from-blue-500 to-blue-600', defaultCode: 'function process(input) {\n  return input;\n}', inputs: 1, outputs: 1 },
  { type: 'variable', label: 'Variable', icon: Package, color: 'from-green-500 to-green-600', defaultCode: 'const value = null;', inputs: 0, outputs: 1 },
  { type: 'condition', label: 'If/Else', icon: GitBranch, color: 'from-yellow-500 to-yellow-600', defaultCode: 'if (condition) {\n  // true branch\n} else {\n  // false branch\n}', inputs: 1, outputs: 2 },
  { type: 'loop', label: 'Loop', icon: RefreshCw, color: 'from-purple-500 to-purple-600', defaultCode: 'for (let i = 0; i < items.length; i++) {\n  // process item\n}', inputs: 1, outputs: 1 },
  { type: 'api', label: 'API Call', icon: Cloud, color: 'from-cyan-500 to-cyan-600', defaultCode: 'const response = await fetch(url);', inputs: 1, outputs: 1 },
  { type: 'database', label: 'Database', icon: Database, color: 'from-indigo-500 to-indigo-600', defaultCode: 'const result = await db.query(sql);', inputs: 1, outputs: 1 },
  { type: 'transform', label: 'Transform', icon: Zap, color: 'from-orange-500 to-orange-600', defaultCode: 'const transformed = data.map(item => item);', inputs: 1, outputs: 1 },
  { type: 'input', label: 'Input', icon: Terminal, color: 'from-teal-500 to-teal-600', defaultCode: 'const input = getUserInput();', inputs: 0, outputs: 1 },
  { type: 'output', label: 'Output', icon: Eye, color: 'from-rose-500 to-rose-600', defaultCode: 'logger.info(output);', inputs: 1, outputs: 0 },
  { type: 'ai', label: 'AI Agent', icon: Cpu, color: 'from-fuchsia-500 to-fuchsia-600', defaultCode: 'const result = await ai.process(prompt);', inputs: 1, outputs: 1 }
];

export default function VisualCodeFlowEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; handle: string } | null>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [codeView, setCodeView] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Add a new node to the canvas
  const addNode = useCallback((template: NodeTemplate, position?: { x: number; y: number }) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}-${Math.random()}`,
      type: template.type,
      label: template.label,
      position: position || { x: 100 + nodes.length * 50, y: 100 + nodes.length * 30 },
      data: {},
      inputs: Array(template.inputs).fill(null).map((_, i) => `input-${i}`),
      outputs: Array(template.outputs).fill(null).map((_, i) => `output-${i}`),
      code: template.defaultCode,
      color: template.color
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
  }, [nodes]);

  // Delete selected node
  const deleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes(nodes.filter(n => n.id !== selectedNode.id));
      setConnections(connections.filter(c => c.source !== selectedNode.id && c.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, nodes, connections]);

  // Generate code from flow
  const generateCode = useCallback(() => {
    let code = '// Generated Code from Visual Flow\n\n';

    // Topological sort to determine execution order
    const visited = new Set<string>();
    const sorted: FlowNode[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Visit dependencies first
      connections
        .filter(c => c.target === nodeId)
        .forEach(c => visit(c.source));

      sorted.push(node);
    };

    nodes.forEach(n => visit(n.id));

    // Generate code for each node
    sorted.forEach(node => {
      code += `// ${node.label} (${node.id})\n`;
      code += node.code || '// No code defined\n';
      code += '\n';
    });

    setGeneratedCode(code);
    setCodeView(true);
  }, [nodes, connections]);

  // Execute the flow
  const executeFlow = useCallback(async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      setExecutionResult({
        success: true,
        message: 'Flow executed successfully!',
        output: {
          nodesExecuted: nodes.length,
          connectionsProcessed: connections.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      setExecutionResult({
        success: false,
        message: 'Execution failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, connections]);

  // Save flow to JSON
  const saveFlow = useCallback(() => {
    const flowData = {
      nodes,
      connections,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, connections]);

  // Load flow from JSON
  const loadFlow = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target?.result as string);
        setNodes(flowData.nodes || []);
        setConnections(flowData.connections || []);
      } catch (error) {
        logger.error('Failed to load flow:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Handle canvas pan
  const handleCanvasPan = useCallback((e: React.MouseEvent) => {
    if (e.buttons === 2 || (e.buttons === 1 && e.shiftKey)) {
      setCanvasOffset({
        x: canvasOffset.x + e.movementX,
        y: canvasOffset.y + e.movementY
      });
    }
  }, [canvasOffset]);

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    setZoom(Math.max(0.5, Math.min(2, zoom + delta)));
  }, [zoom]);

  // Canvas grid background
  const gridPattern = `
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="#ffffff10" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  `;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-semibold">Visual Code Flow Editor</h1>
            </div>
            <span className="text-sm text-white/40">Build applications visually</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Toggle Grid"
            >
              <Grid3x3 className={`h-4 w-4 ${showGrid ? 'text-purple-400' : 'text-white/40'}`} />
            </button>

            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4 text-white/60" />
            </button>

            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4 text-white/60" />
            </button>

            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Toggle Minimap"
            >
              <Maximize2 className={`h-4 w-4 ${showMinimap ? 'text-purple-400' : 'text-white/40'}`} />
            </button>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <button
              onClick={generateCode}
              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg flex items-center gap-2 transition-all"
            >
              <Code className="h-4 w-4" />
              Generate Code
            </button>

            <button
              onClick={executeFlow}
              disabled={isExecuting || nodes.length === 0}
              className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isExecuting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Execute
            </button>

            <button
              onClick={saveFlow}
              className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-2 transition-all"
            >
              <Download className="h-4 w-4" />
              Save
            </button>

            <label className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center gap-2 cursor-pointer transition-all">
              <Upload className="h-4 w-4" />
              Load
              <input type="file" accept=".json" onChange={loadFlow} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Node Templates */}
        <div className="w-64 bg-zinc-900/50 border-r border-white/10 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-white/60 mb-4">NODE LIBRARY</h3>

          <div className="space-y-2">
            {nodeTemplates.map(template => {
              const Icon = template.icon;
              return (
                <div
                  key={template.type}
                  draggable
                  onDragStart={() => setDraggedNode(template.type)}
                  onDragEnd={(e) => {
                    if (canvasRef.current && draggedNode) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const position = {
                        x: (e.clientX - rect.left - canvasOffset.x) / zoom,
                        y: (e.clientY - rect.top - canvasOffset.y) / zoom
                      };
                      const draggedTemplate = nodeTemplates.find(t => t.type === draggedNode);
                      if (draggedTemplate) {
                        addNode(draggedTemplate, position);
                      }
                    }
                    setDraggedNode(null);
                  }}
                  className="p-3 bg-gradient-to-r from-white/5 to-white/10 rounded-lg cursor-move hover:from-white/10 hover:to-white/15 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{template.label}</div>
                      <div className="text-xs text-white/40">
                        {template.inputs > 0 && `${template.inputs} in`}
                        {template.inputs > 0 && template.outputs > 0 && ' · '}
                        {template.outputs > 0 && `${template.outputs} out`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Node Properties */}
          {selectedNode && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-white/60 mb-4">NODE PROPERTIES</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/40">Label</label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => {
                      setNodes(nodes.map(n =>
                        n.id === selectedNode.id
                          ? { ...n, label: e.target.value }
                          : n
                      ));
                      setSelectedNode({ ...selectedNode, label: e.target.value });
                    }}
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40">Code</label>
                  <textarea
                    value={selectedNode.code || ''}
                    onChange={(e) => {
                      setNodes(nodes.map(n =>
                        n.id === selectedNode.id
                          ? { ...n, code: e.target.value }
                          : n
                      ));
                      setSelectedNode({ ...selectedNode, code: e.target.value });
                    }}
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono h-32 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <button
                  onClick={deleteNode}
                  className="w-full px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Node
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="absolute inset-0"
            onMouseMove={handleCanvasPan}
            onContextMenu={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedNode) {
                const rect = canvasRef.current!.getBoundingClientRect();
                const position = {
                  x: (e.clientX - rect.left - canvasOffset.x) / zoom,
                  y: (e.clientY - rect.top - canvasOffset.y) / zoom
                };
                const template = nodeTemplates.find(t => t.type === draggedNode);
                if (template) {
                  addNode(template, position);
                }
                setDraggedNode(null);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Grid Background */}
            {showGrid && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <pattern id="grid" width={40 * zoom} height={40 * zoom} patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="#ffffff10" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}

            {/* Canvas Transform Container */}
            <div
              className="absolute"
              style={{
                transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
                transformOrigin: 'top left'
              }}
            >
              {/* Connections */}
              <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none">
                {connections.map(conn => {
                  const sourceNode = nodes.find(n => n.id === conn.source);
                  const targetNode = nodes.find(n => n.id === conn.target);

                  if (!sourceNode || !targetNode) return null;

                  const sourceX = sourceNode.position.x + 100;
                  const sourceY = sourceNode.position.y + 40;
                  const targetX = targetNode.position.x;
                  const targetY = targetNode.position.y + 40;

                  const midX = (sourceX + targetX) / 2;

                  return (
                    <g key={conn.id}>
                      <path
                        d={`M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`}
                        stroke={selectedConnection?.id === conn.id ? '#a855f7' : '#ffffff20'}
                        strokeWidth="2"
                        fill="none"
                        className="pointer-events-stroke cursor-pointer hover:stroke-purple-400"
                        onClick={() => setSelectedConnection(conn)}
                      />
                      {selectedConnection?.id === conn.id && (
                        <circle
                          cx={(sourceX + targetX) / 2}
                          cy={(sourceY + targetY) / 2}
                          r="20"
                          fill="#a855f730"
                          stroke="#a855f7"
                          strokeWidth="2"
                          className="pointer-events-auto cursor-pointer"
                          onClick={() => {
                            setConnections(connections.filter(c => c.id !== conn.id));
                            setSelectedConnection(null);
                          }}
                        >
                          <title>Click to delete connection</title>
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map(node => {
                const template = nodeTemplates.find(t => t.type === node.type);
                const Icon = template?.icon || Code;

                return (
                  <div
                    key={node.id}
                    className={`absolute group ${selectedNode?.id === node.id ? 'ring-2 ring-purple-500' : ''}`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: '200px'
                    }}
                    onMouseDown={(e) => {
                      setSelectedNode(node);
                      setIsDragging(true);
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startPos = { ...node.position };

                      const handleMouseMove = (e: MouseEvent) => {
                        const deltaX = (e.clientX - startX) / zoom;
                        const deltaY = (e.clientY - startY) / zoom;

                        setNodes(nodes.map(n =>
                          n.id === node.id
                            ? { ...n, position: { x: startPos.x + deltaX, y: startPos.y + deltaY } }
                            : n
                        ));
                      };

                      const handleMouseUp = () => {
                        setIsDragging(false);
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    <div className={`bg-gradient-to-br ${node.color} p-3 rounded-lg shadow-xl cursor-move`}>
                      <div className="flex items-center gap-2 text-white">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{node.label}</span>
                      </div>
                    </div>

                    {/* Input Handles */}
                    {node.inputs.map((input, i) => (
                      <div
                        key={input}
                        className="absolute -left-2 bg-white/20 hover:bg-purple-500 w-4 h-4 rounded-full cursor-crosshair transition-colors"
                        style={{ top: 16 + i * 20 }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          // Handle connection creation
                        }}
                      />
                    ))}

                    {/* Output Handles */}
                    {node.outputs.map((output, i) => (
                      <div
                        key={output}
                        className="absolute -right-2 bg-white/20 hover:bg-green-500 w-4 h-4 rounded-full cursor-crosshair transition-colors"
                        style={{ top: 16 + i * 20 }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setConnectionStart({ nodeId: node.id, handle: output });

                          const handleMouseMove = (e: MouseEvent) => {
                            // Draw temporary connection line
                          };

                          const handleMouseUp = (e: MouseEvent) => {
                            // Check if over a valid input handle
                            const target = e.target as HTMLElement;
                            if (target && connectionStart) {
                              // Create connection
                              const newConnection: Connection = {
                                id: `conn-${Date.now()}`,
                                source: connectionStart.nodeId,
                                sourceHandle: connectionStart.handle,
                                target: node.id, // This should be the target node
                                targetHandle: 'input-0'
                              };
                              setConnections([...connections, newConnection]);
                            }
                            setConnectionStart(null);
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };

                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Minimap */}
            {showMinimap && (
              <div className="absolute bottom-4 right-4 w-48 h-32 bg-zinc-900/90 border border-white/10 rounded-lg p-2">
                <div className="text-xs text-white/40 mb-1">Minimap</div>
                <div className="relative w-full h-20 bg-zinc-950 rounded overflow-hidden">
                  {nodes.map(node => (
                    <div
                      key={node.id}
                      className="absolute bg-purple-500"
                      style={{
                        left: `${(node.position.x / 2000) * 100}%`,
                        top: `${(node.position.y / 1000) * 100}%`,
                        width: '4px',
                        height: '4px'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code View Modal */}
          {codeView && (
            <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl z-50 p-8">
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Generated Code</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                      }}
                      className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg flex items-center gap-2 transition-all"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => setCodeView(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <pre className="flex-1 bg-zinc-900 rounded-lg p-4 overflow-auto">
                  <code className="text-sm text-white/80 font-mono">{generatedCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Execution Results */}
          {executionResult && (
            <div className={`absolute bottom-4 left-4 max-w-md p-4 rounded-lg shadow-xl ${
              executionResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {executionResult.success ? (
                  <Zap className="h-5 w-5 text-green-400 mt-0.5" />
                ) : (
                  <Zap className="h-5 w-5 text-red-400 mt-0.5" />
                )}
                <div>
                  <div className={`font-medium ${executionResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {executionResult.message}
                  </div>
                  {executionResult.output && (
                    <div className="mt-2 text-sm text-white/60">
                      <pre>{JSON.stringify(executionResult.output, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}