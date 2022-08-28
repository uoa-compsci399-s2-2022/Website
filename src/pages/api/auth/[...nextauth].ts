/**
 * NextAuth setup goes here.  The providers we use are:
 *   Instructors
 *     -> Apple
 *     -> GitHub
 *     -> Google
 *   Students
 *     -> Credentials (login with passcode)
 **/
import NextAuth, { Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

const resolveString = (str: string | undefined): string => {
    return str ? str : "undefined";
}

export const authOptions = NextAuth({
    providers: [
        CredentialsProvider({
            id: 'passcode',
            name: 'Login with Passcode',
            credentials: {
                passcode: { label: "Passcode", type: "password" }
            },
            async authorize(credentials, req) {
                if (credentials === undefined) {
                    return null;
                }

                const res: any = await fetch(process.env.NEXTAUTH_URL + '/api/token', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ passcode: credentials.passcode }),
                });
                const user = await res.json();

                if (!res.ok || 'error' in Object.keys(user)) {
                    return null;
                }

                return { ...user, student: true };
            }
        }),
        /* https://next-auth.js.org/providers/github */
        GitHubProvider({
            clientId: resolveString(process.env.GITHUB_ID),
            clientSecret: resolveString(process.env.GITHUB_SECRET),
        }),
        /* https://next-auth.js.org/providers/google */
        GoogleProvider({
            clientId: resolveString(process.env.GOOGLE_CLIENT_ID),
            clientSecret: resolveString(process.env.GOOGLE_CLIENT_SECRET)
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            const response = { ...token };
            if (user && 'student' in user)
                response.student = true;
            return response;
        },
        async session({ session, user, token }) {
            const response: any = { ...session };
            if (response.user && token && 'student' in token)
                response.user.student = true;
            return response;
        }
    },
    adapter: PrismaAdapter(prisma),
    pages: {
        "signIn": "/auth/login",
    }
});

export default authOptions;