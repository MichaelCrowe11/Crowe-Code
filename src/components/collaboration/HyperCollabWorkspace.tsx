"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  MessageSquare,
  Settings,
  Crown,
  Eye,
  Hand,
  Pointer,
  Zap,
  Globe,
  Lock,
  Unlock,
  Copy,
  RefreshCw,
  Volume2,
  VolumeX,
  Monitor,
  Phone,
  PhoneOff,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useSession } from "next-auth/react";
import logger from '../../lib/logger';

interface CollaboratorPresence {
  id: string;
  name: string;
  avatar?: string;
  cursor: { x: number; y: number };
  selection: { start: number; end: number } | null;
  isTyping: boolean;
  isOnline: boolean;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
  lastSeen: Date;
  voice: {
    isMuted: boolean;
    isSpeaking: boolean;
    level: number;
  };
  video: {
    isEnabled: boolean;
    stream?: MediaStream;
  };
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "text" | "system" | "code" | "file";
  reactions?: { emoji: string; users: string[] }[];
}

interface WorkspaceEvent {
  type: "join" | "leave" | "edit" | "cursor" | "voice" | "chat" | "share";
  data: any;
  timestamp: Date;
  userId: string;
}

export default function HyperCollabWorkspace() {
  const { data: session } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [myPresence, setMyPresence] = useState<Partial<CollaboratorPresence>>({});
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoGridRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Initialize WebRTC for voice/video
  const initializeWebRTC = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoEnabled
      });

      mediaStreamRef.current = stream;

      // Setup audio context for voice activity detection
      audioContextRef.current = new AudioContext();
      const analyser = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);

      microphone.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const detectVoice = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        setMyPresence(prev => ({
          ...prev,
          voice: {
            ...prev.voice,
            isSpeaking: average > 20,
            level: average,
            isMuted: !isVoiceEnabled
          }
        }));

        if (isActive) {
          requestAnimationFrame(detectVoice);
        }
      };

      detectVoice();

    } catch (error) {
      logger.error("Failed to initialize WebRTC:", error);
    }
  }, [isVideoEnabled, isVoiceEnabled, isActive]);

  // Initialize collaboration workspace
  const initializeWorkspace = useCallback(async () => {
    if (!session?.user) return;

    const newWorkspaceId = `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setWorkspaceId(newWorkspaceId);
    setConnectionStatus("connecting");

    try {
      // Connect to WebSocket server
      wsRef.current = new WebSocket(`wss://crowecode-main.fly.dev/api/collaboration/ws?workspace=${newWorkspaceId}`);

      wsRef.current.onopen = () => {
        setConnectionStatus("connected");

        // Send initial presence
        const initialPresence: Partial<CollaboratorPresence> = {
          id: session.user.id || session.user.email!,
          name: session.user.name || "Anonymous",
          avatar: session.user.image,
          cursor: { x: 0, y: 0 },
          selection: null,
          isTyping: false,
          isOnline: true,
          role: "owner",
          joinedAt: new Date(),
          lastSeen: new Date(),
          voice: { isMuted: true, isSpeaking: false, level: 0 },
          video: { isEnabled: false }
        };

        setMyPresence(initialPresence);

        wsRef.current?.send(JSON.stringify({
          type: "join",
          data: initialPresence,
          timestamp: new Date(),
          userId: initialPresence.id
        }));
      };

      wsRef.current.onmessage = (event) => {
        const eventData: WorkspaceEvent = JSON.parse(event.data);
        handleWorkspaceEvent(eventData);
      };

      wsRef.current.onclose = () => {
        setConnectionStatus("disconnected");
      };

      wsRef.current.onerror = (error) => {
        logger.error("WebSocket error:", error);
        setConnectionStatus("disconnected");
      };

      // Initialize WebRTC
      await initializeWebRTC();

    } catch (error) {
      logger.error("Failed to initialize workspace:", error);
      setConnectionStatus("disconnected");
    }
  }, [session, initializeWebRTC]);

  const handleWorkspaceEvent = (event: WorkspaceEvent) => {
    switch (event.type) {
      case "join":
        setCollaborators(prev => {
          const existing = prev.find(c => c.id === event.data.id);
          if (existing) {
            return prev.map(c => c.id === event.data.id ? { ...c, ...event.data, isOnline: true } : c);
          }
          return [...prev, { ...event.data, isOnline: true }];
        });

        // Add system message
        setChatMessages(prev => [...prev, {
          id: `system_${Date.now()}`,
          userId: "system",
          userName: "System",
          message: `${event.data.name} joined the workspace`,
          timestamp: event.timestamp,
          type: "system"
        }]);
        break;

      case "leave":
        setCollaborators(prev => prev.map(c =>
          c.id === event.userId ? { ...c, isOnline: false, lastSeen: event.timestamp } : c
        ));
        break;

      case "cursor":
        setCollaborators(prev => prev.map(c =>
          c.id === event.userId ? { ...c, cursor: event.data.cursor } : c
        ));
        break;

      case "chat":
        setChatMessages(prev => [...prev, event.data]);
        break;

      case "voice":
        setCollaborators(prev => prev.map(c =>
          c.id === event.userId ? { ...c, voice: { ...c.voice, ...event.data } } : c
        ));
        break;
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !myPresence.id) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: myPresence.id,
      userName: myPresence.name || "You",
      message: newMessage,
      timestamp: new Date(),
      type: "text"
    };

    wsRef.current.send(JSON.stringify({
      type: "chat",
      data: message,
      timestamp: new Date(),
      userId: myPresence.id
    }));

    setNewMessage("");
  };

  const toggleVoice = async () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    setIsMuted(!isVoiceEnabled);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isVoiceEnabled;
      });
    }

    // Broadcast voice status
    if (wsRef.current && myPresence.id) {
      wsRef.current.send(JSON.stringify({
        type: "voice",
        data: { isMuted: !isVoiceEnabled },
        timestamp: new Date(),
        userId: myPresence.id
      }));
    }
  };

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const shareScreen = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        setIsScreenSharing(true);
        // TODO: Implement screen sharing with WebRTC

      } else {
        setIsScreenSharing(false);
        // Stop screen sharing
      }
    } catch (error) {
      logger.error("Screen sharing failed:", error);
    }
  };

  // Mouse tracking for cursor sharing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive || !wsRef.current || !myPresence.id) return;

      const cursor = { x: e.clientX, y: e.clientY };

      setMyPresence(prev => ({ ...prev, cursor }));

      // Throttle cursor updates
      clearTimeout((window as any).cursorTimeout);
      (window as any).cursorTimeout = setTimeout(() => {
        wsRef.current?.send(JSON.stringify({
          type: "cursor",
          data: { cursor },
          timestamp: new Date(),
          userId: myPresence.id
        }));
      }, 50);
    };

    if (isActive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isActive, myPresence.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-zinc-900 via-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-400/30 p-8"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center"
          >
            <Users className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">
            HyperCollab Workspace
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Enter a revolutionary collaborative environment with real-time editing,
            voice/video chat, screen sharing, and AI-powered pair programming.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsActive(true);
              initializeWorkspace();
            }}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold flex items-center gap-3 mx-auto hover:from-purple-600 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/25"
          >
            <Zap className="w-5 h-5" />
            Start Collaboration
            <Users className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Collaborative Cursors Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-40"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-sm z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold">HyperCollab</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            connectionStatus === "connected"
              ? "bg-green-500/20 border-green-400/30 text-green-400"
              : connectionStatus === "connecting"
              ? "bg-yellow-500/20 border-yellow-400/30 text-yellow-400"
              : "bg-red-500/20 border-red-400/30 text-red-400"
          }`}>
            {connectionStatus === "connected" ? (
              <Wifi className="w-3 h-3" />
            ) : connectionStatus === "connecting" ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <span className="text-xs font-medium capitalize">{connectionStatus}</span>
          </div>

          {workspaceId && (
            <button
              onClick={() => navigator.clipboard.writeText(workspaceId)}
              className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Copy className="w-3 h-3 text-white/60" />
              <span className="text-xs text-white/60">Copy ID</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Controls */}
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-lg transition-colors ${
              isVoiceEnabled
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            }`}
          >
            {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Video Controls */}
          <button
            onClick={toggleVideo}
            className={`p-2 rounded-lg transition-colors ${
              isVideoEnabled
                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                : "bg-zinc-700 text-white/60 hover:bg-zinc-600"
            }`}
          >
            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={shareScreen}
            className={`p-2 rounded-lg transition-colors ${
              isScreenSharing
                ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                : "bg-zinc-700 text-white/60 hover:bg-zinc-600"
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
          >
            <MessageSquare className="w-4 h-4 text-white/60" />
            {chatMessages.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>

          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Workspace */}
        <div className="flex-1 relative">
          {/* Collaborators Bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <AnimatePresence>
              {collaborators.filter(c => c.isOnline).map((collaborator, index) => (
                <motion.div
                  key={collaborator.id}
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2"
                >
                  <div className="relative">
                    {collaborator.avatar ? (
                      <img
                        src={collaborator.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                    )}

                    {/* Voice indicator */}
                    {collaborator.voice.isSpeaking && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    )}

                    {/* Role indicator */}
                    {collaborator.role === "owner" && (
                      <Crown className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-400" />
                    )}
                  </div>

                  <span className="text-xs text-white font-medium">{collaborator.name}</span>

                  {collaborator.isTyping && (
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Video Grid */}
          {isVideoEnabled && (
            <div ref={videoGridRef} className="absolute top-4 right-4 z-20 grid grid-cols-2 gap-2">
              {collaborators.filter(c => c.video.isEnabled).map(collaborator => (
                <div
                  key={collaborator.id}
                  className="w-32 h-24 bg-zinc-800 rounded-lg border border-white/10 overflow-hidden"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-white/40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Content Area */}
          <div className="h-full bg-zinc-900/30 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Collaborative workspace is ready</p>
              <p className="text-white/20 text-sm">Start coding together in real-time</p>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/10 bg-black/30 backdrop-blur-sm flex flex-col"
            >
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Team Chat
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map(message => (
                  <div key={message.id} className={`${
                    message.type === "system" ? "text-center" : ""
                  }`}>
                    {message.type === "system" ? (
                      <p className="text-xs text-white/40 bg-white/5 rounded-full px-3 py-1 inline-block">
                        {message.message}
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white/80">
                            {message.userName}
                          </span>
                          <span className="text-xs text-white/40">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-white/5 rounded-lg px-3 py-2">
                          <p className="text-sm text-white/90">{message.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 text-sm"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="text-white/60">
            {collaborators.filter(c => c.isOnline).length} collaborators online
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/60">
            Workspace: {workspaceId?.slice(-8)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-white/40" />
          <span className="text-white/40">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}