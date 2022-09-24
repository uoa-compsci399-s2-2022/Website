import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

export const Session = {
    typeDefs: gql`
        extend type Query {
            sessions(quizId: String!): [QuizSession!]!
        }
    `,
    queries: {
        sessions: (_parent: any, arg: { quizId: string }, context: Context) => {
            ProtectQuery(context, true);

            return context.prisma.quizSession.findMany({
                where: {
                    quizAssignment: {
                        quiz: {
                            id: arg.quizId
                        }
                    },
                    student: {
                        id: context.session.user.uid,
                    }
                },
            });
        },
    },
    mutations: {},
}