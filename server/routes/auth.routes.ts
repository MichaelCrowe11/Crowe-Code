import { Router } from 'express';
import { authService } from '../services/auth.service';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { logger } from '../services/logger.service';
import { clearLoginAttempts } from '../middleware/rate-limit.middleware';

const { validate, schemas } = validationMiddleware;

export const authRoutes = Router();

// Register new user
authRoutes.post('/register',
  rateLimitMiddleware.auth,
  validate(schemas.register),
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      
      const result = await authService.register({
        username,
        email,
        password,
      });
      
      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }
      
      // Set secure cookie
      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: req.secure || req.get('X-Forwarded-Proto') === 'https',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      
      logger.info({
        event: 'user_registered',
        userId: result.user.id,
        email: result.user.email,
      });
      
      res.status(201).json({
        user: result.user,
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
authRoutes.post('/login',
  rateLimitMiddleware.auth,
  rateLimitMiddleware.bruteForceProtection,
  validate(schemas.login),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login({
        email,
        password,
      });
      
      if (!result.success) {
        logger.warn({
          event: 'login_failed',
          email,
          reason: result.error,
          ip: req.ip,
        });
        
        return res.status(401).json({
          error: result.error || 'Invalid credentials',
        });
      }
      
      // Clear login attempts on successful login
      clearLoginAttempts(email);
      clearLoginAttempts(req.ip);
      
      // Set secure cookie
      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: req.secure || req.get('X-Forwarded-Proto') === 'https',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      
      logger.info({
        event: 'user_logged_in',
        userId: result.user.id,
        email: result.user.email,
      });
      
      res.json({
        user: result.user,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Logout
authRoutes.post('/logout',
  authMiddleware.optional,
  (req, res) => {
    res.clearCookie('auth_token');
    
    if (req.user) {
      logger.info({
        event: 'user_logged_out',
        userId: req.user.id,
      });
    }
    
    res.json({
      message: 'Logout successful',
    });
  }
);

// Get current user
authRoutes.get('/me',
  authMiddleware.required,
  async (req, res, next) => {
    try {
      const user = await authService.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }
      
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token
authRoutes.post('/refresh',
  authMiddleware.required,
  async (req, res, next) => {
    try {
      const result = await authService.refreshToken(req.user.id);
      
      if (!result.success) {
        return res.status(401).json({
          error: 'Failed to refresh token',
        });
      }
      
      // Set new token cookie
      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: req.secure || req.get('X-Forwarded-Proto') === 'https',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      
      res.json({
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Change password
authRoutes.post('/change-password',
  authMiddleware.required,
  validate(z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  })),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const result = await authService.changePassword({
        userId: req.user.id,
        currentPassword,
        newPassword,
      });
      
      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }
      
      logger.info({
        event: 'password_changed',
        userId: req.user.id,
      });
      
      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Request password reset
authRoutes.post('/forgot-password',
  rateLimitMiddleware.auth,
  validate(z.object({
    email: z.string().email(),
  })),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      
      // Always return success to prevent email enumeration
      await authService.requestPasswordReset(email);
      
      res.json({
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      // Log error but don't expose it
      logger.error('Password reset request error:', error);
      res.json({
        message: 'If the email exists, a password reset link has been sent',
      });
    }
  }
);

// Reset password with token
authRoutes.post('/reset-password',
  rateLimitMiddleware.auth,
  validate(z.object({
    token: z.string(),
    newPassword: z.string()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  })),
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      
      const result = await authService.resetPassword({
        token,
        newPassword,
      });
      
      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Invalid or expired reset token',
        });
      }
      
      logger.info({
        event: 'password_reset',
        userId: result.userId,
      });
      
      res.json({
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Google OAuth callback (if configured)
if (process.env.GOOGLE_CLIENT_ID) {
  authRoutes.get('/google',
    (req, res) => {
      // Redirect to Google OAuth
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
      });
      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
    }
  );
  
  authRoutes.get('/google/callback',
    async (req, res, next) => {
      try {
        const { code } = req.query;
        
        if (!code) {
          return res.redirect('/login?error=oauth_failed');
        }
        
        const result = await authService.googleLogin(code as string);
        
        if (!result.success) {
          return res.redirect('/login?error=oauth_failed');
        }
        
        // Set secure cookie
        res.cookie('auth_token', result.token, {
          httpOnly: true,
          secure: req.secure || req.get('X-Forwarded-Proto') === 'https',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        
        res.redirect('/dashboard');
      } catch (error) {
        logger.error('Google OAuth error:', error);
        res.redirect('/login?error=oauth_failed');
      }
    }
  );
}