/*
 * https://www.prisma.io/blog/fullstack-nextjs-graphql-prisma-2-fwpc6ds155#creating-the-graphql-endpoint
 */
import { ApolloServer } from 'apollo-server-micro';
import { PrismaClient } from '@prisma/client';
import { Session as NextSession, unstable_getServerSession } from 'next-auth';

import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import prisma from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';
import { Assignment } from '@/graphql/resolvers/assignment';
import { Class } from '@/graphql/resolvers/class';
import { Group } from '@/graphql/resolvers/group';
import { Question } from '@/graphql/resolvers/question';
import { Quiz } from '@/graphql/resolvers/quiz';
import { Session } from '@/graphql/resolvers/session';
import { Student } from '@/graphql/resolvers/student';

export type Context = {
    prisma: PrismaClient,
    session: NextSession,
};

const apolloServer = new ApolloServer({
    typeDefs: [
        typeDefs,
        Assignment.typeDefs,
        Class.typeDefs,
        Group.typeDefs,
        Question.typeDefs,
        Quiz.typeDefs,
        Session.typeDefs,
        Student.typeDefs,
    ],
    resolvers,
    context: async ({ req, res }): Promise<Context> => {
        const session = await unstable_getServerSession(req, res, authOptions);

        return {
            prisma,
            session,
        }
    },
})

const startServer = apolloServer.start()

export default async function handler(req: any, res: any) {
    if (req.method === 'OPTIONS') {
        res.end();
        return false;
    }
    await startServer;

    await apolloServer.createHandler({
        path: '/api/graphql',
    })(req, res);
}

export const config = {
    api: {
        bodyParser: false,
    },
};