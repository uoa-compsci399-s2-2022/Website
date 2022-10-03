/**
 * NextAuth setup goes here.  The providers we use are:
 *   Instructors
 *     -> Apple
 *     -> GitHub
 *     -> Google
 *   Students
 *     -> Credentials (login with passcode)
 **/
import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

const resolveString = (str: string | undefined): string => {
    return str ? str : "undefined";
}

export const authOptions: NextAuthOptions = {
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
                const response = await res.json();

                if (!res.ok || 'error' in Object.keys(response)) {
                    return null;
                }

                const user = response['user'];
                const type = response['type'];

                const result = { ...user };
                result[type] = true;

                return result;
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
            if (user) {
                response.uid = user.id;
                if ('student' in user) {
                    response.student = true;
                }
                if ('group' in user) {
                    response.group = true;
                    response.student = true;
                }
            }
            return response;
        },
        async session({ session, user, token }) {
            const response: any = { ...session };
            if (response.user && token) {
                response.user.uid = token.uid;
            }
            if (response.user && token && 'student' in token) {
                response.user.student = true;
            }
            if (response.user && token && 'group' in token) {
                response.user.group = true;
                response.user.student = true;
            }
            return response;
        }
    },
    adapter: PrismaAdapter(prisma),
    pages: {
        "signIn": "/auth/login",
    }
};

export default NextAuth(authOptions);