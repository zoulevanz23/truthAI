import NextAuth from 'next-auth';
import { authOptions } from './options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Additional auth routes for the Express server

// Sign in with email/password
export async function signInWithCredentials(email: string, password: string) {
  // This would be called from the frontend
  // In a full implementation, this would use the NextAuth signIn method
  return { success: true, message: 'Credentials signin not implemented on server side' };
}

// Sign up new user
export async function signUpWithCredentials(email: string, password: string, name?: string) {
  // Hash password and create user in DB
  const hashedPassword = await bcrypt.hash(password, 14);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { success: true, user };
}

// Get current user profile
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      apiKeys: true,
    },
  });

  return user;
}

// Revoke API key
export async function revokeApiKey(keyId: string, userId: string) {
  const result = await prisma.apiKey.delete({
    where: { id: keyId, userId },
  });

  return result;
}

// List user's API keys
export async function listApiKeys(userId: string) {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    select: { id: true, name: true, createdAt: true, lastUsed: true },
  });

  return keys;
}

// Create new API key
export async function createApiKey(userId: string, name: string) {
  const key = await prisma.apiKey.create({
    data: {
      userId,
      name,
      key: require('crypto').randomBytes(32).toString('base64'),
    },
    select: { id: true, name: true, key: true, createdAt: true },
  });

  return key;
}