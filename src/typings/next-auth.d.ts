import NextAuth from "next-auth"
import type { DefaultSession } from 'next-auth';

declare module "next-auth" {
    interface Session {
        user?: {
            student?: boolean,
            uid: string,
        } & DefaultSession["user"]
    }
}