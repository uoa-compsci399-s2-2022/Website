import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

export const Quiz = {
    typeDefs: gql`
        extend type Query {
            quiz(id: String!): Quiz
            quizzes: [Quiz!]!
            quizSessions: [QuizSession!]!
            
            upcomingQuizzes: [QuizAssignment!]!
            previousQuizzes: [QuizAssignment!]!
        }
    `,
    queries: {
        quiz: (_parent: any, arg: { id: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quiz.findFirst({
                where: {
                    id: arg.id,
                    user: {
                        id: context.session.user.uid
                    }
                },
                include: {
                    assignments: true,
                    questions: {
                        include: {
                            quizQuestion: true,
                        }
                    },
                }
            });
        },
        quizzes: (_parent: any, _arg: any, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quiz.findMany({
                where: {
                    user: {
                        id: context.session.user.uid
                    }
                },
                include: {
                    assignments: true,
                    questions: {
                        include: {
                            quizQuestion: true,
                        }
                    },
                }
            });
        },

        quizSessions: (_parent: any, _arg: any, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quizSession.findMany({
                where: {
                    quizAssignment: {
                        assignedBy: {
                            id: context.session.user.uid
                        }
                    }
                },
            });
        },

        upcomingQuizzes: (_parent: any, _arg: any, context: Context) => {
            ProtectQuery(context, true);

            return context.prisma.quizAssignment.findMany({
                where: {
                    end: {
                        gte: new Date(),
                    }
                }
            });
        },

        previousQuizzes: (_parent: any, _arg: any, context: Context) => {
            ProtectQuery(context, true);

            return context.prisma.quizAssignment.findMany({
                where: {
                    end: {
                        lte: new Date(),
                    }
                }
            });
        }
    },
    mutations: {

    }
}