"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  Target,
  Zap,
  Workspace,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Brain,
  Leaf,
  Microscope,
  Code,
  Mail,
  Key,
  Globe,
  Rocket
} from "lucide-react";
import FuturisticButton from "@/components/ui/FuturisticButton";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import HolographicDisplay from "@/components/ui/HolographicDisplay";
import QuantumLoader from "@/components/ui/QuantumLoader";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<SetupStepProps>;
  required: boolean;
  estimatedTime: string;
}

interface SetupStepProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  data: any;
  isFirst: boolean;
  isLast: boolean;
}

interface OnboardingData {
  account: {
    name: string;
    email: string;
    role: string;
    organization?: string;
  };
  profile: {
    experience: string;
    interests: string[];
    goals: string[];
  };
  domain: {
    primary: 'agriculture' | 'mycology' | 'coding' | 'general';
    secondary?: string[];
    useCase: string;
  };
  workspace: {
    name: string;
    type: 'personal' | 'team' | 'enterprise';
    features: string[];
  };
  demo: {
    completed: boolean;
    feedback?: string;
  };
}

const setupSteps: SetupStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CroweCode',
    description: 'Begin your journey with intelligent development',
    icon: Sparkles,
    component: WelcomeStep,
    required: true,
    estimatedTime: '1 min'
  },
  {
    id: 'account',
    title: 'Create Account',
    description: 'Set up your CroweCode account',
    icon: User,
    component: AccountSetup,
    required: true,
    estimatedTime: '2 min'
  },
  {
    id: 'profile',
    title: 'Setup Profile',
    description: 'Tell us about your background and interests',
    icon: Settings,
    component: ProfileSetup,
    required: true,
    estimatedTime: '3 min'
  },
  {
    id: 'domain',
    title: 'Choose Domain',
    description: 'Select your primary area of focus',
    icon: Target,
    component: DomainSelection,
    required: true,
    estimatedTime: '2 min'
  },
  {
    id: 'demo',
    title: 'Interactive Demo',
    description: 'Experience CroweCode capabilities',
    icon: Zap,
    component: InteractiveDemo,
    required: false,
    estimatedTime: '5 min'
  },
  {
    id: 'workspace',
    title: 'Create Workspace',
    description: 'Set up your development environment',
    icon: Workspace,
    component: WorkspaceCreation,
    required: true,
    estimatedTime: '3 min'
  }
];

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async (stepData: any) => {
    setIsLoading(true);

    // Update onboarding data
    const stepId = setupSteps[currentStep].id;
    setOnboardingData(prev => ({
      ...prev,
      [stepId]: stepData
    }));

    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, currentStep]));

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }

    setIsLoading(false);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Save onboarding data to backend
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData)
      });

      if (response.ok) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const currentStepData = setupSteps[currentStep];
  const StepComponent = currentStepData.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-blue-950 p-6">
      {/* Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Setup Wizard</h1>
            <p className="text-gray-400">Get started with CroweCode in minutes</p>
          </div>
          <HolographicDisplay variant="badge" color="147, 51, 234" intensity={1}>
            <div className="px-4 py-2">
              Step {currentStep + 1} of {setupSteps.length}
            </div>
          </HolographicDisplay>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / setupSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {setupSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isAccessible = index <= currentStep;

            return (
              <motion.div
                key={step.id}
                className={`flex flex-col items-center ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                whileHover={isAccessible ? { scale: 1.05 } : {}}
                onClick={() => isAccessible && setCurrentStep(index)}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 transition-all
                  ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-400'
                  }
                `}>
                  {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <div className={`text-xs text-center ${
                  isCurrent ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <GlassmorphicCard interactive gradient>
              <div className="p-8">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <QuantumLoader size="lg" />
                    <p className="text-white mt-4">Processing...</p>
                  </div>
                ) : (
                  <StepComponent
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    data={onboardingData[currentStepData.id] || {}}
                    isFirst={currentStep === 0}
                    isLast={currentStep === setupSteps.length - 1}
                  />
                )}
              </div>
            </GlassmorphicCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto mt-8 text-center"
      >
        <p className="text-gray-500 text-sm">
          Need help? Check our{' '}
          <a href="/docs" className="text-purple-400 hover:text-purple-300">
            documentation
          </a>{' '}
          or{' '}
          <a href="/support" className="text-purple-400 hover:text-purple-300">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ onNext, isFirst, isLast }: SetupStepProps) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Brain className="h-24 w-24 text-purple-400 mx-auto mb-4" />
        <h2 className="text-4xl font-bold text-white mb-4">
          Welcome to CroweCode Intelligence
        </h2>
        <p className="text-xl text-gray-300 mb-6">
          The world's most advanced AI-powered development platform
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">Agriculture</h3>
          <p className="text-gray-400">Smart farming and IoT integration</p>
        </div>
        <div className="text-center">
          <Microscope className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">Mycology</h3>
          <p className="text-gray-400">Laboratory information management</p>
        </div>
        <div className="text-center">
          <Code className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">Development</h3>
          <p className="text-gray-400">AI-powered coding assistance</p>
        </div>
      </div>

      <div className="flex justify-center">
        <FuturisticButton
          variant="quantum"
          size="lg"
          onClick={() => onNext({ welcomed: true })}
          icon={<Rocket className="h-5 w-5" />}
        >
          Get Started
        </FuturisticButton>
      </div>
    </div>
  );
}

// Account Setup Component
function AccountSetup({ onNext, onPrevious, data, isFirst }: SetupStepProps) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    email: data.email || '',
    role: data.role || '',
    organization: data.organization || ''
  });

  const roles = [
    'Developer',
    'Researcher',
    'Farmer',
    'Lab Technician',
    'Student',
    'Manager',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <User className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-gray-400">Tell us a bit about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select your role</option>
              {roles.map(role => (
                <option key={role} value={role} className="bg-gray-800">
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Organization
            </label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Company or institution (optional)"
            />
          </div>
        </div>

        <div className="flex justify-between">
          {!isFirst && (
            <FuturisticButton
              variant="glass"
              onClick={onPrevious}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </FuturisticButton>
          )}
          <FuturisticButton
            type="submit"
            variant="quantum"
            className={isFirst ? 'ml-auto' : ''}
            icon={<ChevronRight className="h-4 w-4" />}
          >
            Continue
          </FuturisticButton>
        </div>
      </form>
    </div>
  );
}

// Profile Setup Component
function ProfileSetup({ onNext, onPrevious, data }: SetupStepProps) {
  const [formData, setFormData] = useState({
    experience: data.experience || '',
    interests: data.interests || [],
    goals: data.goals || []
  });

  const experienceLevels = [
    'Beginner (Less than 1 year)',
    'Intermediate (1-3 years)',
    'Advanced (3-5 years)',
    'Expert (5+ years)'
  ];

  const availableInterests = [
    'Software Development',
    'Agriculture Technology',
    'Mushroom Cultivation',
    'Data Science',
    'IoT & Sensors',
    'Machine Learning',
    'Laboratory Management',
    'Research & Development'
  ];

  const availableGoals = [
    'Learn new technologies',
    'Improve productivity',
    'Automate processes',
    'Build better software',
    'Manage lab operations',
    'Optimize farming',
    'Conduct research',
    'Scale operations'
  ];

  const toggleSelection = (item: string, type: 'interests' | 'goals') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(item)
        ? prev[type].filter(i => i !== item)
        : [...prev[type], item]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Settings className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Setup Your Profile</h2>
        <p className="text-gray-400">Help us personalize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-white text-sm font-medium mb-3">
            Experience Level *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experienceLevels.map(level => (
              <label key={level} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="experience"
                  value={level}
                  checked={formData.experience === level}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="sr-only"
                />
                <div className={`
                  w-full p-3 rounded-lg border-2 transition-all text-center
                  ${formData.experience === level
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:border-purple-400'
                  }
                `}>
                  {level}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-3">
            Areas of Interest (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableInterests.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleSelection(interest, 'interests')}
                className={`
                  p-3 rounded-lg border-2 transition-all text-sm
                  ${formData.interests.includes(interest)
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:border-blue-400'
                  }
                `}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-3">
            Goals (Select your main objectives)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableGoals.map(goal => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleSelection(goal, 'goals')}
                className={`
                  p-3 rounded-lg border-2 transition-all text-sm
                  ${formData.goals.includes(goal)
                    ? 'border-yellow-500 bg-yellow-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:border-yellow-400'
                  }
                `}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <FuturisticButton
            variant="glass"
            onClick={onPrevious}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </FuturisticButton>
          <FuturisticButton
            type="submit"
            variant="quantum"
            disabled={!formData.experience}
            icon={<ChevronRight className="h-4 w-4" />}
          >
            Continue
          </FuturisticButton>
        </div>
      </form>
    </div>
  );
}

// Domain Selection Component
function DomainSelection({ onNext, onPrevious, data }: SetupStepProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>(data.primary || '');
  const [useCase, setUseCase] = useState(data.useCase || '');

  const domains = [
    {
      id: 'agriculture',
      title: 'Smart Agriculture',
      description: 'IoT sensors, crop monitoring, yield prediction',
      icon: Leaf,
      color: 'green',
      features: ['Sensor Integration', 'Crop Health Analysis', 'Weather Monitoring', 'Yield Forecasting']
    },
    {
      id: 'mycology',
      title: 'Mycology LIMS',
      description: 'Laboratory management, strain tracking, quality control',
      icon: Microscope,
      color: 'blue',
      features: ['Sample Tracking', 'Protocol Management', 'Quality Control', 'Genetic Analysis']
    },
    {
      id: 'coding',
      title: 'AI Development',
      description: 'AI-powered coding, review, debugging, optimization',
      icon: Code,
      color: 'purple',
      features: ['Code Completion', 'AI Review', 'Auto-debugging', 'Optimization']
    },
    {
      id: 'general',
      title: 'General Purpose',
      description: 'Multi-domain platform with all capabilities',
      icon: Brain,
      color: 'gray',
      features: ['All Domains', 'Custom Workflows', 'Flexible Integration', 'Multi-modal AI']
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      primary: selectedDomain,
      useCase
    });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Target className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Domain</h2>
        <p className="text-gray-400">Select your primary area of focus</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {domains.map(domain => {
            const Icon = domain.icon;
            const isSelected = selectedDomain === domain.id;

            return (
              <motion.div
                key={domain.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected
                    ? `border-${domain.color}-500 bg-${domain.color}-500/20`
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                  }
                `}
                onClick={() => setSelectedDomain(domain.id)}
              >
                <div className="flex items-start space-x-4">
                  <Icon className={`h-12 w-12 text-${domain.color}-400`} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {domain.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {domain.description}
                    </p>
                    <div className="space-y-1">
                      {domain.features.map(feature => (
                        <div key={feature} className="flex items-center text-xs text-gray-300">
                          <Check className="h-3 w-3 mr-2 text-green-400" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {selectedDomain && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <label className="block text-white text-sm font-medium">
              Describe your specific use case (optional)
            </label>
            <textarea
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="Tell us about your specific needs, goals, or projects..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
            />
          </motion.div>
        )}

        <div className="flex justify-between">
          <FuturisticButton
            variant="glass"
            onClick={onPrevious}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </FuturisticButton>
          <FuturisticButton
            type="submit"
            variant="quantum"
            disabled={!selectedDomain}
            icon={<ChevronRight className="h-4 w-4" />}
          >
            Continue
          </FuturisticButton>
        </div>
      </form>
    </div>
  );
}

// Interactive Demo Component
function InteractiveDemo({ onNext, onPrevious }: SetupStepProps) {
  const [demoCompleted, setDemoCompleted] = useState(false);

  const handleComplete = () => {
    setDemoCompleted(true);
    onNext({ completed: true });
  };

  const handleSkip = () => {
    onNext({ completed: false, skipped: true });
  };

  return (
    <div className="text-center">
      <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Interactive Demo</h2>
      <p className="text-gray-400 mb-8">Experience CroweCode capabilities firsthand</p>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Demo Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white">AI Assistant</p>
            </div>
            <div className="text-center">
              <Code className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white">Code Generation</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-white">Smart Analysis</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <FuturisticButton
            variant="glass"
            onClick={handleSkip}
          >
            Skip Demo
          </FuturisticButton>
          <FuturisticButton
            variant="quantum"
            onClick={handleComplete}
            icon={<Zap className="h-4 w-4" />}
          >
            Start Demo
          </FuturisticButton>
        </div>

        <div className="flex justify-between">
          <FuturisticButton
            variant="glass"
            onClick={onPrevious}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </FuturisticButton>
        </div>
      </div>
    </div>
  );
}

// Workspace Creation Component
function WorkspaceCreation({ onNext, onPrevious, data, isLast }: SetupStepProps) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    type: data.type || 'personal',
    features: data.features || []
  });

  const workspaceTypes = [
    {
      id: 'personal',
      title: 'Personal',
      description: 'For individual use',
      price: 'Free'
    },
    {
      id: 'team',
      title: 'Team',
      description: 'For small teams (up to 10 members)',
      price: '$29/month'
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      description: 'For large organizations',
      price: 'Contact us'
    }
  ];

  const availableFeatures = [
    'Real-time Collaboration',
    'Advanced AI Models',
    'Custom Integrations',
    'Priority Support',
    'Enhanced Security',
    'Analytics Dashboard'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Workspace className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Workspace</h2>
        <p className="text-gray-400">Set up your development environment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Workspace Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="My Workspace"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-3">
            Workspace Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workspaceTypes.map(type => (
              <div
                key={type.id}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${formData.type === type.id
                    ? 'border-cyan-500 bg-cyan-500/20'
                    : 'border-white/20 bg-white/5 hover:border-cyan-400'
                  }
                `}
                onClick={() => setFormData({ ...formData, type: type.id as any })}
              >
                <h3 className="text-lg font-semibold text-white">{type.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{type.description}</p>
                <p className="text-cyan-400 font-medium">{type.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <FuturisticButton
            variant="glass"
            onClick={onPrevious}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </FuturisticButton>
          <FuturisticButton
            type="submit"
            variant="quantum"
            icon={isLast ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          >
            {isLast ? 'Complete Setup' : 'Continue'}
          </FuturisticButton>
        </div>
      </form>
    </div>
  );
}