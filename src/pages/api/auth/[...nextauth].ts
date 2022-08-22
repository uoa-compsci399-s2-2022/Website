/**
 * NextAuth setup goes here.  The providers we use are:
 *   Instructors
 *     -> Apple
 *     -> GitHub
 *     -> Google
 *   Students
 *     -> Credentials (login with passcode)
 **/
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import AppleProvider from 'next-auth/providers/apple';
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
                // check GraphQL database for our passcode
                if (credentials?.passcode === "abcd") {
                    return {
                        not_sure: true
                    }
                }
                return null;
            }
        }),
        /* https://next-auth.js.org/providers/apple */
        AppleProvider({
            clientId: resolveString(process.env.APPLE_ID),
            clientSecret: resolveString(process.env.APPLE_SECRET)
        }),
        /* https://next-auth.js.org/providers/github */
        GitHubProvider({
            clientId: resolveString(process.env.GITHUB_ID),
            clientSecret: resolveString(process.env.GITHUB_SECRET)
        }),
        /* https://next-auth.js.org/providers/google */
        GoogleProvider({
            clientId: resolveString(process.env.GOOGLE_CLIENT_ID),
            clientSecret: resolveString(process.env.GOOGLE_CLIENT_SECRET)
        })
    ],
    adapter: PrismaAdapter(prisma),
    pages: {
        "signIn": "/auth/login",
    }
});

export default authOptions;