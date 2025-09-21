"use client";

import React, { useState, useCallback } from 'react';
import { Cloud, Upload, Globe, Shield, Zap, Server, Database, Lock, Activity, CheckCircle, AlertTriangle, Info, Settings, GitBranch, Package, Layers, Network, DollarSign, BarChart, Play, Pause, RefreshCw, Download, ChevronRight, ArrowUpRight, Copy, Terminal } from 'lucide-react';

interface CloudProvider {
  id: string;
  name: string;
  logo: string;
  regions: string[];
  services: string[];
  status: 'connected' | 'disconnected' | 'pending';
  costEstimate?: number;
}

interface DeploymentConfig {
  id: string;
  name: string;
  provider: string;
  region: string;
  instanceType: string;
  replicas: number;
  autoscaling: boolean;
  minReplicas: number;
  maxReplicas: number;
  environment: 'production' | 'staging' | 'development';
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  networking: {
    loadBalancer: boolean;
    cdn: boolean;
    ssl: boolean;
    customDomain?: string;
  };
  monitoring: {
    logging: boolean;
    metrics: boolean;
    alerts: boolean;
  };
  estimatedCost: number;
}

interface Deployment {
  id: string;
  config: DeploymentConfig;
  status: 'pending' | 'deploying' | 'running' | 'failed' | 'stopped';
  health: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastDeployed: string;
  url?: string;
  metrics?: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
    latency: number;
  };
}

const cloudProviders: CloudProvider[] = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    logo: '☁️',
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
    services: ['EC2', 'ECS', 'Lambda', 'S3', 'RDS', 'CloudFront'],
    status: 'connected'
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    logo: '🌐',
    regions: ['us-central1', 'europe-west1', 'asia-east1', 'australia-southeast1'],
    services: ['Compute Engine', 'Cloud Run', 'Cloud Functions', 'Cloud Storage', 'Cloud SQL'],
    status: 'connected'
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    logo: '☁️',
    regions: ['eastus', 'westeurope', 'southeastasia', 'australiaeast'],
    services: ['Virtual Machines', 'App Service', 'Functions', 'Blob Storage', 'SQL Database'],
    status: 'disconnected'
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    logo: '🌊',
    regions: ['nyc1', 'sfo3', 'lon1', 'sgp1'],
    services: ['Droplets', 'App Platform', 'Spaces', 'Managed Databases'],
    status: 'connected'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    logo: '▲',
    regions: ['Global Edge Network'],
    services: ['Edge Functions', 'Static Sites', 'Serverless Functions'],
    status: 'connected'
  }
];

const instanceTypes = {
  aws: ['t3.micro', 't3.small', 't3.medium', 't3.large', 'm5.large', 'm5.xlarge'],
  gcp: ['e2-micro', 'e2-small', 'e2-medium', 'n2-standard-2', 'n2-standard-4'],
  azure: ['B1s', 'B2s', 'D2s_v3', 'D4s_v3', 'D8s_v3'],
  digitalocean: ['s-1vcpu-1gb', 's-2vcpu-2gb', 's-4vcpu-8gb', 's-8vcpu-16gb'],
  vercel: ['Hobby', 'Pro', 'Enterprise']
};

export default function MultiCloudDeployment() {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(cloudProviders[0]);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    id: '',
    name: 'my-app',
    provider: 'aws',
    region: 'us-east-1',
    instanceType: 't3.small',
    replicas: 2,
    autoscaling: true,
    minReplicas: 1,
    maxReplicas: 5,
    environment: 'production',
    resources: {
      cpu: '1 vCPU',
      memory: '2 GB',
      storage: '20 GB'
    },
    networking: {
      loadBalancer: true,
      cdn: true,
      ssl: true,
      customDomain: ''
    },
    monitoring: {
      logging: true,
      metrics: true,
      alerts: true
    },
    estimatedCost: 45
  });
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);

  // Calculate cost estimate
  const calculateCost = useCallback(() => {
    const baseCosts: { [key: string]: number } = {
      't3.micro': 8,
      't3.small': 16,
      't3.medium': 32,
      't3.large': 64,
      'm5.large': 96,
      'm5.xlarge': 192
    };

    const baseCost = baseCosts[deploymentConfig.instanceType] || 50;
    const replicaCost = baseCost * deploymentConfig.replicas;
    const networkingCost = (deploymentConfig.networking.loadBalancer ? 20 : 0) +
                          (deploymentConfig.networking.cdn ? 15 : 0);
    const storageCost = parseInt(deploymentConfig.resources.storage) * 0.1;

    return Math.round(replicaCost + networkingCost + storageCost);
  }, [deploymentConfig]);

  // Deploy application
  const deployApplication = useCallback(async () => {
    setIsDeploying(true);

    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newDeployment: Deployment = {
      id: `deploy-${Date.now()}`,
      config: deploymentConfig,
      status: 'running',
      health: 'healthy',
      uptime: 0,
      lastDeployed: new Date().toISOString(),
      url: `https://${deploymentConfig.name}.${deploymentConfig.provider}.app`,
      metrics: {
        cpu: Math.random() * 50 + 20,
        memory: Math.random() * 60 + 30,
        requests: Math.floor(Math.random() * 10000),
        errors: Math.floor(Math.random() * 10),
        latency: Math.random() * 100 + 50
      }
    };

    setDeployments([...deployments, newDeployment]);
    setSelectedDeployment(newDeployment);
    setIsDeploying(false);
  }, [deploymentConfig, deployments]);

  // Generate deployment script
  const generateDeploymentScript = useCallback(() => {
    const scripts: { [key: string]: string } = {
      aws: `# AWS Deployment Script
aws ecs create-cluster --cluster-name ${deploymentConfig.name}
aws ecs register-task-definition --family ${deploymentConfig.name} \\
  --cpu ${deploymentConfig.resources.cpu} \\
  --memory ${deploymentConfig.resources.memory}
aws ecs create-service --cluster ${deploymentConfig.name} \\
  --service-name ${deploymentConfig.name}-service \\
  --task-definition ${deploymentConfig.name} \\
  --desired-count ${deploymentConfig.replicas}`,

      gcp: `# GCP Deployment Script
gcloud run deploy ${deploymentConfig.name} \\
  --image gcr.io/project/${deploymentConfig.name} \\
  --platform managed \\
  --region ${deploymentConfig.region} \\
  --allow-unauthenticated \\
  --min-instances ${deploymentConfig.minReplicas} \\
  --max-instances ${deploymentConfig.maxReplicas}`,

      azure: `# Azure Deployment Script
az group create --name ${deploymentConfig.name}-rg --location ${deploymentConfig.region}
az appservice plan create --name ${deploymentConfig.name}-plan \\
  --resource-group ${deploymentConfig.name}-rg \\
  --sku ${deploymentConfig.instanceType}
az webapp create --name ${deploymentConfig.name} \\
  --resource-group ${deploymentConfig.name}-rg \\
  --plan ${deploymentConfig.name}-plan`,

      digitalocean: `# DigitalOcean Deployment Script
doctl apps create --spec - <<EOF
name: ${deploymentConfig.name}
region: ${deploymentConfig.region}
services:
- name: web
  instance_size_slug: ${deploymentConfig.instanceType}
  instance_count: ${deploymentConfig.replicas}
EOF`,

      vercel: `# Vercel Deployment Script
vercel --prod \\
  --name ${deploymentConfig.name} \\
  --regions ${deploymentConfig.region} \\
  --env NODE_ENV=${deploymentConfig.environment}`
    };

    return scripts[deploymentConfig.provider] || '# Deployment script not available';
  }, [deploymentConfig]);

  // Get health color
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'deploying': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'stopped': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-semibold">Multi-Cloud Deployment</h1>
            </div>
            <span className="text-sm text-white/40">Deploy anywhere, manage everywhere</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-400">
                Est. ${calculateCost()}/month
              </span>
            </div>

            <button
              onClick={deployApplication}
              disabled={isDeploying}
              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Deploy Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Provider Selection */}
        <div className="w-80 bg-zinc-900/50 border-r border-white/10 p-6 overflow-y-auto">
          <h3 className="text-sm font-medium text-white/60 mb-4">CLOUD PROVIDERS</h3>

          <div className="space-y-3">
            {cloudProviders.map(provider => (
              <div
                key={provider.id}
                className={`p-4 bg-white/5 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                  selectedProvider?.id === provider.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => {
                  setSelectedProvider(provider);
                  setDeploymentConfig({ ...deploymentConfig, provider: provider.id, region: provider.regions[0] });
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.logo}</span>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-white/40">{provider.regions.length} regions</div>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    provider.status === 'connected' ? 'bg-green-400' :
                    provider.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`} />
                </div>

                {selectedProvider?.id === provider.id && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-white/60 mb-2">Available Services:</div>
                    <div className="flex flex-wrap gap-1">
                      {provider.services.slice(0, 4).map(service => (
                        <span key={service} className="text-xs px-2 py-1 bg-white/10 rounded">
                          {service}
                        </span>
                      ))}
                      {provider.services.length > 4 && (
                        <span className="text-xs px-2 py-1 text-white/40">
                          +{provider.services.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active Deployments */}
          <h3 className="text-sm font-medium text-white/60 mt-8 mb-4">ACTIVE DEPLOYMENTS</h3>

          {deployments.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active deployments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deployments.map(deployment => (
                <div
                  key={deployment.id}
                  className={`p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all ${
                    selectedDeployment?.id === deployment.id ? 'ring-1 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedDeployment(deployment)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{deployment.config.name}</span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(deployment.status)}`} />
                  </div>
                  <div className="text-xs text-white/40">
                    {deployment.config.provider} • {deployment.config.region}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs ${getHealthColor(deployment.health)}`}>
                      {deployment.health}
                    </span>
                    {deployment.url && (
                      <a
                        href={deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl">
            <h2 className="text-lg font-semibold mb-6">Deployment Configuration</h2>

            <div className="space-y-6">
              {/* Basic Configuration */}
              <div className="p-6 bg-white/5 rounded-xl">
                <h3 className="text-sm font-medium text-white/60 mb-4">BASIC SETTINGS</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Application Name</label>
                    <input
                      type="text"
                      value={deploymentConfig.name}
                      onChange={(e) => setDeploymentConfig({ ...deploymentConfig, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Environment</label>
                    <select
                      value={deploymentConfig.environment}
                      onChange={(e) => setDeploymentConfig({ ...deploymentConfig, environment: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Region</label>
                    <select
                      value={deploymentConfig.region}
                      onChange={(e) => setDeploymentConfig({ ...deploymentConfig, region: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                    >
                      {selectedProvider?.regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Instance Type</label>
                    <select
                      value={deploymentConfig.instanceType}
                      onChange={(e) => setDeploymentConfig({ ...deploymentConfig, instanceType: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                    >
                      {(instanceTypes[deploymentConfig.provider as keyof typeof instanceTypes] || []).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Scaling Configuration */}
              <div className="p-6 bg-white/5 rounded-xl">
                <h3 className="text-sm font-medium text-white/60 mb-4">SCALING & REPLICAS</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deploymentConfig.autoscaling}
                        onChange={(e) => setDeploymentConfig({ ...deploymentConfig, autoscaling: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Enable Autoscaling</span>
                    </label>
                  </div>

                  {deploymentConfig.autoscaling ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-white/60 mb-1 block">Min Replicas</label>
                        <input
                          type="number"
                          min="1"
                          value={deploymentConfig.minReplicas}
                          onChange={(e) => setDeploymentConfig({ ...deploymentConfig, minReplicas: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white/60 mb-1 block">Max Replicas</label>
                        <input
                          type="number"
                          min="1"
                          value={deploymentConfig.maxReplicas}
                          onChange={(e) => setDeploymentConfig({ ...deploymentConfig, maxReplicas: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white/60 mb-1 block">Target CPU %</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          defaultValue="70"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">Fixed Replicas</label>
                      <input
                        type="number"
                        min="1"
                        value={deploymentConfig.replicas}
                        onChange={(e) => setDeploymentConfig({ ...deploymentConfig, replicas: parseInt(e.target.value) })}
                        className="w-full max-w-xs px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Networking */}
              <div className="p-6 bg-white/5 rounded-xl">
                <h3 className="text-sm font-medium text-white/60 mb-4">NETWORKING</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deploymentConfig.networking.loadBalancer}
                      onChange={(e) => setDeploymentConfig({
                        ...deploymentConfig,
                        networking: { ...deploymentConfig.networking, loadBalancer: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Enable Load Balancer</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deploymentConfig.networking.cdn}
                      onChange={(e) => setDeploymentConfig({
                        ...deploymentConfig,
                        networking: { ...deploymentConfig.networking, cdn: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Enable CDN</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deploymentConfig.networking.ssl}
                      onChange={(e) => setDeploymentConfig({
                        ...deploymentConfig,
                        networking: { ...deploymentConfig.networking, ssl: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Enable SSL/TLS</span>
                  </label>

                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Custom Domain (optional)</label>
                    <input
                      type="text"
                      placeholder="app.example.com"
                      value={deploymentConfig.networking.customDomain}
                      onChange={(e) => setDeploymentConfig({
                        ...deploymentConfig,
                        networking: { ...deploymentConfig.networking, customDomain: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Deployment Script */}
              <div className="p-6 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/60">DEPLOYMENT SCRIPT</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(generateDeploymentScript())}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs flex items-center gap-1 transition-all"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>

                <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto">
                  <code className="text-xs text-white/80">{generateDeploymentScript()}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        {selectedDeployment && (
          <div className="w-80 bg-zinc-900/50 border-l border-white/10 p-6">
            <h3 className="text-sm font-medium text-white/60 mb-4">DEPLOYMENT METRICS</h3>

            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/60">CPU Usage</span>
                  <span className="text-xs font-medium">{selectedDeployment.metrics?.cpu.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${selectedDeployment.metrics?.cpu}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/60">Memory Usage</span>
                  <span className="text-xs font-medium">{selectedDeployment.metrics?.memory.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${selectedDeployment.metrics?.memory}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Requests</div>
                  <div className="text-lg font-medium">{selectedDeployment.metrics?.requests.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Errors</div>
                  <div className="text-lg font-medium text-red-400">{selectedDeployment.metrics?.errors}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Latency</div>
                  <div className="text-lg font-medium">{selectedDeployment.metrics?.latency.toFixed(0)}ms</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Uptime</div>
                  <div className="text-lg font-medium text-green-400">99.9%</div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Open Console
                </button>
                <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                  <Activity className="h-4 w-4" />
                  View Logs
                </button>
                <button className="w-full px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                  <Pause className="h-4 w-4" />
                  Stop Deployment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}