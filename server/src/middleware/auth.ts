import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from './db';

/**
 * Register a new user with email and password.
 * Hashes the password and creates a user in the database.
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 14;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET || 'development-secret-key',
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user with email and password.
 * Verifies credentials and returns a JWT token.
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET || 'development-secret-key',
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile (protected route).
 * Requires valid JWT token in Authorization header.
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        settings: true,
        apiKeys: {
          select: { id: true, name: true, createdAt: true, lastUsed: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        settings: user.settings,
        apiKeys: user.apiKeys,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate a new API key for the authenticated user.
 * Protected route - requires auth middleware.
 */
export async function createApiKeyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name } = req.body || {};

    const key = await prisma.apiKey.create({
      data: {
        userId: req.user.id,
        name,
        key: require('crypto').randomBytes(32).toString('base64'),
      },
      select: { id: true, name: true, key: true, createdAt: true, lastUsed: true },
    });

    // Don't return the full key on subsequent calls; only on creation
    const responseKey = key.key;
    delete key;

    return res.json({
      success: true,
      key: responseKey,
      keyId: key.id,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Revoke (delete) an API key.
 * Protected route - requires auth middleware and key ownership.
 */
export async function revokeApiKeyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { keyId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const deleted = await prisma.apiKey.delete({
      where: { id: keyId, userId: req.user.id },
    });

    return res.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'API key not found' });
    }
    next(error);
  }
}

/**
 * Optional auth middleware - attaches user if JWT present, but doesn't fail if absent.
 * Use for routes that work both for authenticated and anonymous users.
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'development-secret-key'
    ) as { id: string };

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
  } catch {
    req.user = null;
  }

  next();
}

/**
 * Required auth middleware - fails with 401 if no valid JWT token.
 * Use for protected routes that require authentication.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - no token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'development-secret-key'
    ) as { id: string };

    if (!decoded.id) {
      return res.status(401).json({ error: 'Unauthorized - invalid token payload' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if ((error as any).name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized - invalid token' });
    }
    if ((error as any).name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized - token expired' });
    }
    return res.status(401).json({ error: 'Unauthorized - token verification failed' });
  }
}

/**
 * Check if request has authenticated user.
 */
export function isAuthenticated(req: Request): boolean {
  return !!req.user?.id;
}