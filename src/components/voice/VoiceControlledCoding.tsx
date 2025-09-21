"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, Zap, Brain, Code, Terminal, MessageSquare, Settings, HelpCircle, ChevronRight, CheckCircle, XCircle, AlertCircle, Loader2, Sparkles, Headphones, Activity } from 'lucide-react';

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  parameters?: string[];
  confidence: number;
  timestamp: string;
  executed: boolean;
  result?: string;
  code?: string;
}

interface CodeSnippet {
  language: string;
  code: string;
  description: string;
}

interface VoiceSettings {
  language: string;
  speed: number;
  pitch: number;
  volume: number;
  wakeWord: string;
  autoExecute: boolean;
  confirmActions: boolean;
}

const predefinedCommands = [
  { trigger: 'create function', action: 'CREATE_FUNCTION', example: 'Create function calculateSum with parameters a and b' },
  { trigger: 'add variable', action: 'ADD_VARIABLE', example: 'Add variable count equals zero' },
  { trigger: 'write loop', action: 'WRITE_LOOP', example: 'Write for loop from 0 to 10' },
  { trigger: 'import', action: 'IMPORT', example: 'Import useState from React' },
  { trigger: 'create class', action: 'CREATE_CLASS', example: 'Create class User with constructor' },
  { trigger: 'add comment', action: 'ADD_COMMENT', example: 'Add comment This function calculates total' },
  { trigger: 'refactor', action: 'REFACTOR', example: 'Refactor this code for better performance' },
  { trigger: 'debug', action: 'DEBUG', example: 'Debug the current function' },
  { trigger: 'test', action: 'GENERATE_TEST', example: 'Generate test for calculateSum function' },
  { trigger: 'explain', action: 'EXPLAIN', example: 'Explain this code block' },
  { trigger: 'optimize', action: 'OPTIMIZE', example: 'Optimize this algorithm' },
  { trigger: 'document', action: 'DOCUMENT', example: 'Document this function' },
  { trigger: 'convert', action: 'CONVERT', example: 'Convert to TypeScript' },
  { trigger: 'find', action: 'FIND', example: 'Find all instances of getUserData' },
  { trigger: 'replace', action: 'REPLACE', example: 'Replace all var with const' }
];

export default function VoiceControlledCoding() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [generatedCode, setGeneratedCode] = useState<CodeSnippet[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'en-US',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    wakeWord: 'Hey Code',
    autoExecute: false,
    confirmActions: true
  });
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<VoiceCommand | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = settings.language;

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            processVoiceCommand(finalTranscript.trim());
          }

          setTranscript(interimTranscript || finalTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [settings.language]);

  // Process voice command
  const processVoiceCommand = useCallback(async (text: string) => {
    setIsProcessing(true);

    // Find matching command
    const matchedCommand = predefinedCommands.find(cmd =>
      text.toLowerCase().includes(cmd.trigger.toLowerCase())
    );

    if (matchedCommand) {
      const command: VoiceCommand = {
        id: `cmd-${Date.now()}`,
        command: text,
        action: matchedCommand.action,
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        executed: false
      };

      // Generate code based on command
      const code = await generateCodeFromCommand(command);
      command.code = code.code;
      command.result = code.description;

      if (settings.autoExecute && !settings.confirmActions) {
        command.executed = true;
      }

      setCommands(prev => [command, ...prev]);
      setGeneratedCode(prev => [code, ...prev]);

      // Speak confirmation
      if (settings.volume > 0) {
        speakResponse(`Generated ${code.description}`);
      }
    }

    setIsProcessing(false);
    setTranscript('');
  }, [settings]);

  // Generate code from command
  const generateCodeFromCommand = async (command: VoiceCommand): Promise<CodeSnippet> => {
    // Simulate AI code generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const codeTemplates: { [key: string]: CodeSnippet } = {
      CREATE_FUNCTION: {
        language: 'javascript',
        code: `function calculateSum(a, b) {
  return a + b;
}`,
        description: 'a function to calculate sum'
      },
      ADD_VARIABLE: {
        language: 'javascript',
        code: 'const count = 0;',
        description: 'a variable declaration'
      },
      WRITE_LOOP: {
        language: 'javascript',
        code: `for (let i = 0; i < 10; i++) {
  console.log(i);
}`,
        description: 'a for loop'
      },
      IMPORT: {
        language: 'javascript',
        code: "import { useState } from 'react';",
        description: 'an import statement'
      },
      CREATE_CLASS: {
        language: 'javascript',
        code: `class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  getInfo() {
    return \`\${this.name} (\${this.email})\`;
  }
}`,
        description: 'a User class'
      },
      GENERATE_TEST: {
        language: 'javascript',
        code: `describe('calculateSum', () => {
  test('should return sum of two numbers', () => {
    expect(calculateSum(2, 3)).toBe(5);
    expect(calculateSum(-1, 1)).toBe(0);
    expect(calculateSum(0, 0)).toBe(0);
  });
});`,
        description: 'unit tests'
      },
      ADD_COMMENT: {
        language: 'javascript',
        code: '// This function calculates the total sum of all items',
        description: 'a comment'
      },
      DOCUMENT: {
        language: 'javascript',
        code: `/**
 * Calculates the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum of a and b
 */`,
        description: 'JSDoc documentation'
      }
    };

    return codeTemplates[command.action] || {
      language: 'javascript',
      code: '// Generated code will appear here',
      description: 'code snippet'
    };
  };

  // Speak response
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.speed;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      initializeAudioAnalyzer();
    }
  };

  // Initialize audio analyzer for visual feedback
  const initializeAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Execute command
  const executeCommand = (command: VoiceCommand) => {
    setCommands(commands.map(cmd =>
      cmd.id === command.id ? { ...cmd, executed: true } : cmd
    ));
    speakResponse(`Executed ${command.result}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Mic className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-semibold">Voice-Controlled Coding</h1>
            </div>
            <span className="text-sm text-white/40">Code with natural language commands</span>
          </div>

          <div className="flex items-center gap-3">
            {speechSupported ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Voice Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-lg">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">Voice Not Supported</span>
              </div>
            )}

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-white/60" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 text-white/60" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Control Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Microphone Button */}
          <div className="relative mb-8">
            <button
              onClick={toggleListening}
              disabled={!speechSupported}
              className={`relative p-8 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 scale-110 shadow-2xl shadow-purple-500/50'
                  : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30'
              } ${!speechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? (
                <Mic className="h-12 w-12 text-white" />
              ) : (
                <MicOff className="h-12 w-12 text-white/60" />
              )}

              {/* Audio Level Indicator */}
              {isListening && (
                <div
                  className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.5})`,
                    opacity: audioLevel
                  }}
                />
              )}
            </button>

            {/* Status */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {isListening ? (
                <span className="text-sm text-purple-400 flex items-center gap-2">
                  <Activity className="h-4 w-4 animate-pulse" />
                  Listening...
                </span>
              ) : (
                <span className="text-sm text-white/40">Click to start</span>
              )}
            </div>
          </div>

          {/* Transcript Display */}
          <div className="w-full max-w-2xl mb-8">
            <div className="p-4 bg-white/5 rounded-lg min-h-[80px]">
              {transcript ? (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-white/60 mb-1">You said:</div>
                    <div className="text-lg">{transcript}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-white/30">
                  {isListening ? 'Say a command...' : 'Voice commands will appear here'}
                </div>
              )}
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-3 mb-8">
              <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              <span className="text-purple-400">Processing command...</span>
            </div>
          )}

          {/* Quick Commands */}
          <div className="w-full max-w-4xl">
            <h3 className="text-sm font-medium text-white/60 mb-4">QUICK COMMANDS</h3>
            <div className="grid grid-cols-3 gap-3">
              {predefinedCommands.slice(0, 6).map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => processVoiceCommand(cmd.example)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all group"
                >
                  <div className="font-medium text-sm mb-1">{cmd.trigger}</div>
                  <div className="text-xs text-white/40 group-hover:text-white/60">
                    "{cmd.example}"
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Command History */}
        <div className="w-96 bg-zinc-900/50 border-l border-white/10 p-6 overflow-y-auto">
          <h3 className="text-sm font-medium text-white/60 mb-4">COMMAND HISTORY</h3>

          {commands.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No commands yet</p>
              <p className="text-xs mt-1">Start speaking to see commands here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commands.map((command) => (
                <div
                  key={command.id}
                  className={`p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all ${
                    selectedCommand?.id === command.id ? 'ring-1 ring-purple-500/50' : ''
                  }`}
                  onClick={() => setSelectedCommand(command)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40">
                      {new Date(command.timestamp).toLocaleTimeString()}
                    </span>
                    {command.executed ? (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                        Executed
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium mb-1">{command.command}</div>

                  {command.result && (
                    <div className="text-xs text-white/60 mb-2">
                      Generated {command.result}
                    </div>
                  )}

                  {command.code && (
                    <pre className="text-xs bg-zinc-900 p-2 rounded overflow-x-auto">
                      <code>{command.code}</code>
                    </pre>
                  )}

                  {!command.executed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        executeCommand(command);
                      }}
                      className="mt-2 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-xs transition-all"
                    >
                      Execute
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Voice Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-white/60">Speech Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.speed}
                  onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
                <span className="text-xs text-white/40">{settings.speed}x</span>
              </div>

              <div>
                <label className="text-sm text-white/60">Wake Word</label>
                <input
                  type="text"
                  value={settings.wakeWord}
                  onChange={(e) => setSettings({ ...settings, wakeWord: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoExecute"
                  checked={settings.autoExecute}
                  onChange={(e) => setSettings({ ...settings, autoExecute: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="autoExecute" className="text-sm">Auto-execute commands</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confirmActions"
                  checked={settings.confirmActions}
                  onChange={(e) => setSettings({ ...settings, confirmActions: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="confirmActions" className="text-sm">Confirm before actions</label>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
            >
              Close Settings
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Voice Commands Help</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Available Commands:</h3>
                <div className="space-y-2">
                  {predefinedCommands.map((cmd, index) => (
                    <div key={index} className="p-2 bg-white/5 rounded">
                      <div className="font-medium text-sm text-purple-400">{cmd.trigger}</div>
                      <div className="text-xs text-white/60 mt-1">Example: "{cmd.example}"</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Tips:</h3>
                <ul className="list-disc list-inside text-sm text-white/60 space-y-1">
                  <li>Speak clearly and naturally</li>
                  <li>Pause briefly between commands</li>
                  <li>Use the wake word for hands-free activation</li>
                  <li>Review generated code before executing</li>
                  <li>Customize settings for your preference</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
            >
              Close Help
            </button>
          </div>
        </div>
      )}
    </div>
  );
}