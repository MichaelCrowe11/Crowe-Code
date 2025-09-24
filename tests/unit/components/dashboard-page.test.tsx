import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardPage from '@/app/dashboard/page';

// Mock dependencies
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next/dynamic', () => ({
  default: (fn: any) => {
    const Component = fn();
    return Component;
  },
}));

// Mock heavy components
vi.mock('@/components/ai/AIChatInterface', () => {
  return ({ onSubmit, ...props }: any) => (
    <div data-testid="ai-chat-interface" {...props}>
      <input
        data-testid="ai-input"
        placeholder="Ask CroweCode Intelligence..."
        onChange={(e) => onSubmit?.(e.target.value)}
      />
    </div>
  );
});

vi.mock('@/components/ai/QuantumCodeEngine', () => {
  return (props: any) => (
    <div data-testid="quantum-code-engine" {...props}>
      Quantum Code Engine
    </div>
  );
});

vi.mock('@/components/collaboration/HyperCollabWorkspace', () => {
  return (props: any) => (
    <div data-testid="hyper-collab-workspace" {...props}>
      Collaboration Workspace
    </div>
  );
});

vi.mock('@/components/branding/CroweCodeLogo', () => {
  return (props: any) => <div data-testid="crowe-code-logo" {...props}>CroweCode</div>;
});

vi.mock('@/components/branding/CroweLogicBranding', () => ({
  CroweLogicBadge: (props: any) => <div data-testid="crowe-logic-badge" {...props}>CroweLogic</div>,
}));

vi.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('DashboardPage', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as any).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication States', () => {
    it('should show loading state when session is loading', () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<DashboardPage />);

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toHaveClass('animate-spin');
    });

    it('should redirect to sign-in when unauthenticated', async () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<DashboardPage />);

      expect(screen.getByText('Redirecting to sign in…')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/auth/signin?callbackUrl=/dashboard');
      });
    });

    it('should render dashboard when authenticated', () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      (useSession as any).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<DashboardPage />);

      // Should render main dashboard content
      expect(screen.getByTestId('crowe-code-logo')).toBeInTheDocument();
      expect(screen.getByTestId('crowe-logic-badge')).toBeInTheDocument();
    });
  });

  describe('Dashboard Navigation', () => {
    beforeEach(() => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      (useSession as any).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('should show overview tab by default', () => {
      render(<DashboardPage />);

      // Should show overview content by default
      expect(screen.getByText('12543')).toBeInTheDocument(); // API calls stat
      expect(screen.getByText('2.4 GB')).toBeInTheDocument(); // Storage used
    });

    it('should switch to AI tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const aiTab = screen.getByText('AI Assistant');
      await user.click(aiTab);

      expect(screen.getByTestId('ai-chat-interface')).toBeInTheDocument();
    });

    it('should switch to Quantum tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const quantumTab = screen.getByText('Quantum Engine');
      await user.click(quantumTab);

      expect(screen.getByTestId('quantum-code-engine')).toBeInTheDocument();
    });

    it('should switch to Collaboration tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const collabTab = screen.getByText('Collaboration');
      await user.click(collabTab);

      expect(screen.getByTestId('hyper-collab-workspace')).toBeInTheDocument();
    });

    it('should handle active tab styling', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const overviewTab = screen.getByText('Overview');
      const aiTab = screen.getByText('AI Assistant');

      // Overview should be active by default
      expect(overviewTab.closest('button')).toHaveClass('bg-blue-600');

      // Switch to AI tab
      await user.click(aiTab);
      expect(aiTab.closest('button')).toHaveClass('bg-blue-600');
      expect(overviewTab.closest('button')).not.toHaveClass('bg-blue-600');
    });
  });

  describe('Overview Statistics', () => {
    beforeEach(() => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      (useSession as any).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('should display API usage statistics', () => {
      render(<DashboardPage />);

      expect(screen.getByText('API Calls')).toBeInTheDocument();
      expect(screen.getByText('12543')).toBeInTheDocument();
      expect(screen.getByText('of 50,000')).toBeInTheDocument();
    });

    it('should display storage statistics', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Storage Used')).toBeInTheDocument();
      expect(screen.getByText('2.4 GB')).toBeInTheDocument();
      expect(screen.getByText('of 10 GB')).toBeInTheDocument();
    });

    it('should display project count', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should display collaborator count', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display build minutes', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Build Minutes')).toBeInTheDocument();
      expect(screen.getByText('234')).toBeInTheDocument();
      expect(screen.getByText('of 1,000')).toBeInTheDocument();
    });
  });

  describe('API Keys Management', () => {
    beforeEach(() => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      (useSession as any).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('should display existing API keys', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const apiKeysTab = screen.getByText('API Keys');
      await user.click(apiKeysTab);

      expect(screen.getByText('Production API')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('clp_live_sk_...7d8f')).toBeInTheDocument();
      expect(screen.getByText('clp_test_sk_...4a2c')).toBeInTheDocument();
    });

    it('should open new API key modal', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const apiKeysTab = screen.getByText('API Keys');
      await user.click(apiKeysTab);

      const createButton = screen.getByText('Create New Key');
      await user.click(createButton);

      expect(screen.getByText('Create New API Key')).toBeInTheDocument();
      expect(screen.getByLabelText('Key Name')).toBeInTheDocument();
    });

    it('should generate new API key', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const apiKeysTab = screen.getByText('API Keys');
      await user.click(apiKeysTab);

      const createButton = screen.getByText('Create New Key');
      await user.click(createButton);

      const nameInput = screen.getByLabelText('Key Name');
      await user.type(nameInput, 'Test Key');

      const generateButton = screen.getByText('Generate Key');
      await user.click(generateButton);

      // Should show generated key (mocked)
      expect(screen.getByText(/clp_live_sk_/)).toBeInTheDocument();
      expect(screen.getByText('Copy Key')).toBeInTheDocument();
    });

    it('should copy API key to clipboard', async () => {
      const user = userEvent.setup();

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });

      render(<DashboardPage />);

      const apiKeysTab = screen.getByText('API Keys');
      await user.click(apiKeysTab);

      const createButton = screen.getByText('Create New Key');
      await user.click(createButton);

      const nameInput = screen.getByLabelText('Key Name');
      await user.type(nameInput, 'Test Key');

      const generateButton = screen.getByText('Generate Key');
      await user.click(generateButton);

      const copyButton = screen.getByText('Copy Key');
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('should show API key usage statistics', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const apiKeysTab = screen.getByText('API Keys');
      await user.click(apiKeysTab);

      expect(screen.getByText('3421 calls')).toBeInTheDocument();
      expect(screen.getByText('892 calls')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('5 days ago')).toBeInTheDocument();
    });
  });

  describe('Projects Management', () => {
    beforeEach(() => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      (useSession as any).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('should display project list', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      expect(screen.getByText('AI Chat Bot')).toBeInTheDocument();
      expect(screen.getByText('Mobile App API')).toBeInTheDocument();
    });

    it('should show project details', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
      expect(screen.getByText('Go')).toBeInTheDocument();
      expect(screen.getByText('12.4 MB')).toBeInTheDocument();
      expect(screen.getByText('4.2 MB')).toBeInTheDocument();
      expect(screen.getByText('8.7 MB')).toBeInTheDocument();
    });

    it('should show project activity timestamps', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
      expect(screen.getByText('3 days ago')).toBeInTheDocument();
    });

    it('should show project stars', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('67')).toBeInTheDocument();
    });
  });

  describe('User Profile', () => {
    beforeEach(() => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      (useSession as any).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('should display user information', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const profileTab = screen.getByText('Profile');
      await user.click(profileTab);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show user role', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const profileTab = screen.getByText('Profile');
      await user.click(profileTab);

      expect(screen.getByText('USER')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      (useSession as any).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('should render on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<DashboardPage />);

      // Should still render main elements
      expect(screen.getByTestId('crowe-code-logo')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('should handle tablet viewports', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<DashboardPage />);

      expect(screen.getByTestId('crowe-code-logo')).toBeInTheDocument();
      expect(screen.getByText('API Calls')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing session data gracefully', () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'authenticated', // Authenticated but no session data
      });

      render(<DashboardPage />);

      expect(screen.getByText('Redirecting to sign in…')).toBeInTheDocument();
    });

    it('should handle session errors', () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'error',
      });

      render(<DashboardPage />);

      // Should treat error status as unauthenticated
      expect(screen.getByText('Redirecting to sign in…')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      (useSession as any).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('should lazy load heavy components', () => {
      render(<DashboardPage />);

      // Heavy components should be mocked/lazy loaded
      expect(screen.queryByTestId('ai-chat-interface')).not.toBeInTheDocument();
      expect(screen.queryByTestId('quantum-code-engine')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hyper-collab-workspace')).not.toBeInTheDocument();
    });
  });
});