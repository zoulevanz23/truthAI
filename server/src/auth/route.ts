import NextAuth from 'next-auth';
import { authOptions } from './options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Export types for use in routes
export type { NextAuthOptions } from './options';