import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/login/page';

// Mock dependencies
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

vi.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  );
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock custom UI components
vi.mock('@/components/ui/NeuralBackground', () => {
  return ({ children, ...props }: any) => (
    <div data-testid="neural-background" {...props}>
      {children}
    </div>
  );
});

vi.mock('@/components/ui/GlassmorphicCard', () => {
  return ({ children, ...props }: any) => (
    <div data-testid="glassmorphic-card" {...props}>
      {children}
    </div>
  );
});

vi.mock('@/components/ui/FuturisticButton', () => {
  return ({ children, loading, disabled, onClick, ...props }: any) => (
    <button
      data-testid="futuristic-button"
      disabled={loading || disabled}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
});

vi.mock('@/components/ui/HolographicDisplay', () => {
  return ({ children, ...props }: any) => (
    <div data-testid="holographic-display" {...props}>
      {children}
    </div>
  );
});

vi.mock('@/components/ui/QuantumLoader', () => {
  return (props: any) => (
    <div data-testid="quantum-loader" {...props}>
      Loading...
    </div>
  );
});

describe('LoginPage', () => {
  const mockPush = vi.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as any).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    });

    (useSearchParams as any).mockReturnValue({
      get: vi.fn((key) => {
        if (key === 'callbackUrl') return null;
        return mockSearchParams.get(key);
      }),
    });

    (signIn as any).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the login page with all main elements', () => {
      render(<LoginPage />);

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to continue your journey')).toBeInTheDocument();
      expect(screen.getByText('Continue with GitHub')).toBeInTheDocument();
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render the CroweCode logo and branding', () => {
      render(<LoginPage />);

      expect(screen.getByText('crowe/code')).toBeInTheDocument();
      expect(screen.getByTestId('neural-background')).toBeInTheDocument();
      expect(screen.getByTestId('glassmorphic-card')).toBeInTheDocument();
    });

    it('should render security badges', () => {
      render(<LoginPage />);

      expect(screen.getByText('End-to-end encrypted')).toBeInTheDocument();
      expect(screen.getByText('Lightning fast')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<LoginPage />);

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });
  });

  describe('OAuth Authentication', () => {
    it('should handle GitHub OAuth sign-in', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const githubButton = screen.getByText('Continue with GitHub').closest('button');
      await user.click(githubButton!);

      expect(signIn).toHaveBeenCalledWith('github', {
        callbackUrl: '/dashboard',
      });
    });

    it('should handle Google OAuth sign-in', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const googleButton = screen.getByText('Continue with Google').closest('button');
      await user.click(googleButton!);

      expect(signIn).toHaveBeenCalledWith('google', {
        callbackUrl: '/dashboard',
      });
    });

    it('should show loading state for OAuth buttons', async () => {
      const user = userEvent.setup();
      (signIn as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<LoginPage />);

      const githubButton = screen.getByText('Continue with GitHub').closest('button');
      await user.click(githubButton!);

      expect(screen.getByTestId('quantum-loader')).toBeInTheDocument();

      // Google button should be disabled while GitHub is loading
      const googleButton = screen.getByText('Continue with Google').closest('button');
      expect(googleButton).toBeDisabled();
    });

    it('should use custom callback URL from search params', () => {
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((key) => {
          if (key === 'callbackUrl') return '/dashboard/projects';
          return null;
        }),
      });

      const user = userEvent.setup();
      render(<LoginPage />);

      const githubButton = screen.getByText('Continue with GitHub').closest('button');
      fireEvent.click(githubButton!);

      expect(signIn).toHaveBeenCalledWith('github', {
        callbackUrl: '/dashboard/projects',
      });
    });
  });

  describe('Credentials Authentication', () => {
    it('should handle credentials sign-in with valid data', async () => {
      const user = userEvent.setup();
      (signIn as any).mockResolvedValue({ ok: true });

      render(<LoginPage />);

      // Fill out the form
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
          callbackUrl: '/dashboard',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show error message for invalid credentials', async () => {
      const user = userEvent.setup();
      (signIn as any).mockResolvedValue({ error: 'CredentialsSignin' });

      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      (signIn as any).mockRejectedValue(new Error('Network error'));

      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
      });
    });

    it('should show loading state during credentials sign-in', async () => {
      const user = userEvent.setup();
      let resolveSignIn: (value: any) => void;
      (signIn as any).mockImplementation(() => new Promise(resolve => {
        resolveSignIn = resolve;
      }));

      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Form inputs should be disabled
      expect(screen.getByLabelText('Email Address')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();

      // Resolve the sign-in
      resolveSignIn!({ ok: true });

      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
      });
    });

    it('should require email and password fields', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Form should not submit without required fields
      expect(signIn).not.toHaveBeenCalled();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it('should validate email format', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('Email Address');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should hide password input', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Interaction', () => {
    it('should update email state when typing', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password state when typing', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should clear error when retrying', async () => {
      const user = userEvent.setup();
      (signIn as any).mockResolvedValueOnce({ error: 'CredentialsSignin' });

      render(<LoginPage />);

      // First attempt - should show error
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      // Second attempt - error should clear
      (signIn as any).mockResolvedValueOnce({ ok: true });
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
      });
    });

    it('should handle remember me checkbox', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const rememberCheckbox = screen.getByLabelText('Remember me');
      expect(rememberCheckbox).not.toBeChecked();

      await user.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();
    });
  });

  describe('Navigation and Links', () => {
    it('should have correct navigation links', () => {
      render(<LoginPage />);

      const signUpLink = screen.getByText('Create Account');
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');

      const forgotPasswordLink = screen.getByText('Forgot password?');
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      render(<LoginPage />);

      const form = screen.getByRole('form', { name: /sign in/i }) ||
                   screen.getByLabelText('Email Address').closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should provide placeholder text for inputs', () => {
      render(<LoginPage />);

      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error with icon', async () => {
      const user = userEvent.setup();
      (signIn as any).mockResolvedValue({ error: 'CredentialsSignin' });

      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const errorMessage = screen.getByText('Invalid email or password');
        expect(errorMessage).toBeInTheDocument();

        // Error should be in a styled container
        const errorContainer = errorMessage.closest('div');
        expect(errorContainer).toHaveClass('text-red-400');
      });
    });

    it('should handle different types of authentication errors', async () => {
      const user = userEvent.setup();
      const testCases = [
        { error: 'CredentialsSignin', expected: 'Invalid email or password' },
        { error: 'AccessDenied', expected: 'Invalid email or password' },
        { error: null, expected: 'Invalid email or password' },
      ];

      for (const testCase of testCases) {
        (signIn as any).mockResolvedValueOnce({ error: testCase.error });

        render(<LoginPage />);

        await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
          expect(screen.getByText(testCase.expected)).toBeInTheDocument();
        });

        // Clean up for next iteration
        screen.unmount();
      }
    });
  });

  describe('Responsive Design', () => {
    it('should render properly on mobile viewports', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<LoginPage />);

      // Should still render all main elements
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });
});