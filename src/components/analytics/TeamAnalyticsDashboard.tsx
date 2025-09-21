"use client";

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, GitCommit, Clock, Code, Bug, CheckCircle, AlertTriangle, Activity, Calendar, BarChart3, PieChart, Award, Target, Zap, GitBranch, FileCode, MessageSquare, Star, RefreshCw, Download, Filter, ChevronRight, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  pullRequests: number;
  codeReviews: number;
  bugs: number;
  features: number;
  productivity: number;
  qualityScore: number;
  velocity: number;
  status: 'active' | 'idle' | 'offline';
}

interface ProjectMetrics {
  totalCommits: number;
  totalPullRequests: number;
  averageReviewTime: number;
  codeChurn: number;
  testCoverage: number;
  buildSuccessRate: number;
  deploymentFrequency: number;
  leadTime: number;
  mttr: number; // Mean Time To Recovery
  cycleTime: number;
}

interface SprintMetrics {
  name: string;
  startDate: string;
  endDate: string;
  velocity: number;
  completedStories: number;
  totalStories: number;
  bugs: number;
  spillover: number;
  satisfaction: number;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: '👨‍💻',
    role: 'Senior Developer',
    commits: 145,
    linesAdded: 8420,
    linesDeleted: 3210,
    pullRequests: 28,
    codeReviews: 42,
    bugs: 3,
    features: 12,
    productivity: 92,
    qualityScore: 88,
    velocity: 34,
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: '👩‍💻',
    role: 'Lead Engineer',
    commits: 198,
    linesAdded: 12450,
    linesDeleted: 5670,
    pullRequests: 35,
    codeReviews: 58,
    bugs: 2,
    features: 18,
    productivity: 95,
    qualityScore: 94,
    velocity: 42,
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    avatar: '🧑‍💻',
    role: 'Full Stack Developer',
    commits: 112,
    linesAdded: 6890,
    linesDeleted: 2340,
    pullRequests: 22,
    codeReviews: 31,
    bugs: 5,
    features: 9,
    productivity: 78,
    qualityScore: 82,
    velocity: 28,
    status: 'idle'
  },
  {
    id: '4',
    name: 'Emily Davis',
    avatar: '👩‍💻',
    role: 'Frontend Developer',
    commits: 89,
    linesAdded: 5230,
    linesDeleted: 1890,
    pullRequests: 19,
    codeReviews: 25,
    bugs: 1,
    features: 8,
    productivity: 85,
    qualityScore: 91,
    velocity: 25,
    status: 'active'
  },
  {
    id: '5',
    name: 'James Brown',
    avatar: '👨‍💻',
    role: 'Backend Developer',
    commits: 156,
    linesAdded: 9870,
    linesDeleted: 4320,
    pullRequests: 31,
    codeReviews: 38,
    bugs: 4,
    features: 14,
    productivity: 88,
    qualityScore: 86,
    velocity: 38,
    status: 'offline'
  }
];

const mockProjectMetrics: ProjectMetrics = {
  totalCommits: 700,
  totalPullRequests: 135,
  averageReviewTime: 2.4,
  codeChurn: 18.5,
  testCoverage: 78,
  buildSuccessRate: 94,
  deploymentFrequency: 12,
  leadTime: 3.2,
  mttr: 1.8,
  cycleTime: 4.5
};

const mockSprintMetrics: SprintMetrics[] = [
  {
    name: 'Sprint 24',
    startDate: '2024-01-01',
    endDate: '2024-01-14',
    velocity: 42,
    completedStories: 18,
    totalStories: 20,
    bugs: 3,
    spillover: 2,
    satisfaction: 4.2
  },
  {
    name: 'Sprint 25',
    startDate: '2024-01-15',
    endDate: '2024-01-28',
    velocity: 48,
    completedStories: 21,
    totalStories: 22,
    bugs: 2,
    spillover: 1,
    satisfaction: 4.5
  }
];

export default function TeamAnalyticsDashboard() {
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [projectMetrics] = useState<ProjectMetrics>(mockProjectMetrics);
  const [sprintMetrics] = useState<SprintMetrics[]>(mockSprintMetrics);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [view, setView] = useState<'overview' | 'performance' | 'quality' | 'velocity'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate team totals
  const teamTotals = {
    commits: teamMembers.reduce((sum, m) => sum + m.commits, 0),
    linesAdded: teamMembers.reduce((sum, m) => sum + m.linesAdded, 0),
    linesDeleted: teamMembers.reduce((sum, m) => sum + m.linesDeleted, 0),
    pullRequests: teamMembers.reduce((sum, m) => sum + m.pullRequests, 0),
    codeReviews: teamMembers.reduce((sum, m) => sum + m.codeReviews, 0),
    avgProductivity: Math.round(teamMembers.reduce((sum, m) => sum + m.productivity, 0) / teamMembers.length),
    avgQuality: Math.round(teamMembers.reduce((sum, m) => sum + m.qualityScore, 0) / teamMembers.length)
  };

  // Refresh data
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  // Get trend icon
  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-3 w-3 text-green-400" />;
    if (value < 0) return <ArrowDown className="h-3 w-3 text-red-400" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-semibold">Team Analytics Dashboard</h1>
            </div>
            <span className="text-sm text-white/40">Real-time team performance metrics</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>

            <button
              onClick={refreshData}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg flex items-center gap-2 transition-all">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-1">
            {['overview', 'performance', 'quality', 'velocity'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab as any)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  view === tab
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Team Velocity</span>
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">
              {sprintMetrics[sprintMetrics.length - 1]?.velocity || 0}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(8)}
              <span className="text-xs text-white/40">+8% from last sprint</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Code Quality</span>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">
              {teamTotals.avgQuality}%
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(3)}
              <span className="text-xs text-white/40">+3% improvement</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Productivity</span>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {teamTotals.avgProductivity}%
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(5)}
              <span className="text-xs text-white/40">+5% this month</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Test Coverage</span>
              <Shield className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {projectMetrics.testCoverage}%
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(2)}
              <span className="text-xs text-white/40">+2% increase</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members Performance */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Team Performance</h3>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-white/40" />
                  <select className="px-2 py-1 bg-white/5 border border-white/10 rounded text-sm">
                    <option>All Members</option>
                    <option>Active Only</option>
                    <option>Top Performers</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className={`p-4 bg-white/5 rounded-lg border transition-all cursor-pointer hover:bg-white/10 ${
                      selectedMember?.id === member.id
                        ? 'border-purple-500/50 bg-purple-500/5'
                        : 'border-white/10'
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="text-2xl">{member.avatar}</div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${getStatusColor(member.status)}`} />
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-white/40">{member.role}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-medium">{member.commits}</div>
                          <div className="text-xs text-white/40">Commits</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{member.pullRequests}</div>
                          <div className="text-xs text-white/40">PRs</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-400">{member.qualityScore}%</div>
                          <div className="text-xs text-white/40">Quality</div>
                        </div>
                        <div className="w-24">
                          <div className="text-xs text-white/40 mb-1">Productivity</div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${member.productivity}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedMember?.id === member.id && (
                      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-white/40">Lines Added</div>
                          <div className="text-sm font-medium text-green-400">+{member.linesAdded.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40">Lines Deleted</div>
                          <div className="text-sm font-medium text-red-400">-{member.linesDeleted.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40">Code Reviews</div>
                          <div className="text-sm font-medium">{member.codeReviews}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40">Velocity</div>
                          <div className="text-sm font-medium">{member.velocity} pts</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40">Features</div>
                          <div className="text-sm font-medium text-blue-400">{member.features}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40">Bugs Fixed</div>
                          <div className="text-sm font-medium text-yellow-400">{member.bugs}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sprint Overview */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Sprint Overview</h3>

              <div className="space-y-4">
                {sprintMetrics.map((sprint, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{sprint.name}</div>
                        <div className="text-xs text-white/40">
                          {sprint.startDate} - {sprint.endDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-400">{sprint.velocity}</div>
                        <div className="text-xs text-white/40">Story Points</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-white/40">Completion:</span>
                        <span className="ml-2 font-medium">
                          {Math.round((sprint.completedStories / sprint.totalStories) * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40">Bugs:</span>
                        <span className="ml-2 font-medium text-yellow-400">{sprint.bugs}</span>
                      </div>
                      <div>
                        <span className="text-white/40">Satisfaction:</span>
                        <span className="ml-2 font-medium text-green-400">
                          {sprint.satisfaction}/5 ⭐
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${(sprint.completedStories / sprint.totalStories) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Metrics */}
          <div className="space-y-6">
            {/* Project Health */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Project Health</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Build Success Rate</span>
                  <span className="text-sm font-medium text-green-400">
                    {projectMetrics.buildSuccessRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Deployment Frequency</span>
                  <span className="text-sm font-medium">
                    {projectMetrics.deploymentFrequency}/month
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Lead Time</span>
                  <span className="text-sm font-medium">
                    {projectMetrics.leadTime} days
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">MTTR</span>
                  <span className="text-sm font-medium text-yellow-400">
                    {projectMetrics.mttr} hours
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Cycle Time</span>
                  <span className="text-sm font-medium">
                    {projectMetrics.cycleTime} days
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Code Churn</span>
                  <span className="text-sm font-medium text-orange-400">
                    {projectMetrics.codeChurn}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Avg Review Time</span>
                  <span className="text-sm font-medium">
                    {projectMetrics.averageReviewTime} hours
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-500/10 rounded">
                    <GitCommit className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">Sarah merged PR #234</div>
                    <div className="text-xs text-white/40">2 minutes ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-500/10 rounded">
                    <Code className="h-3 w-3 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">Alex completed review</div>
                    <div className="text-xs text-white/40">15 minutes ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-yellow-500/10 rounded">
                    <Bug className="h-3 w-3 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">Mike fixed critical bug</div>
                    <div className="text-xs text-white/40">1 hour ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-purple-500/10 rounded">
                    <Star className="h-3 w-3 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">Emily deployed v2.3.0</div>
                    <div className="text-xs text-white/40">3 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded">
                    <MessageSquare className="h-3 w-3 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">James commented on #231</div>
                    <div className="text-xs text-white/40">5 hours ago</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">Top Performers</h3>
              </div>

              <div className="space-y-3">
                {teamMembers
                  .sort((a, b) => b.productivity - a.productivity)
                  .slice(0, 3)
                  .map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-white/40">
                          {member.productivity}% productivity
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}