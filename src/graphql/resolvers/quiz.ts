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

        extend type Mutation {
            createQuiz(
                name: String!,
                description: String!,
                questions: Int!, 
                timeLimit: Int!
            ): Quiz

            updateQuiz(
                id: String!,
                name: String,
                description: String,
                timeLimit: Int
            ): Quiz
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

        createQuiz: (_parent: any, args: { name: string, description: string, questions: number, timeLimit: number }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quiz.create({
                data: {
                    user: {
                        connect: {
                            id: context.session.user.uid,
                        }
                    },
                    name: args.name,
                    description: args.description,
                    timeLimit: args.timeLimit,
                    questions: {
                        create: new Array(args.questions).fill(0).map(() => {
                            return {
                                timeLimit: 0,
                            }
                        })
                    }
                },
                include: {
                    assignments: {
                        include: {
                            sessions: true,
                            students: true,
                        }
                    },
                    questions: {
                        include: {
                            quizQuestion: true,
                        }
                    },
                }
            })
        },

        updateQuiz: (_parent: any, args: { id: string, name?: string, description?: string, timeLimit?: number }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quiz.update({
                where: {
                    id: args.id,
                },
                data: {
                    name: args.name,
                    description: args.description,
                    timeLimit: args.timeLimit,
                },
                include: {
                    assignments: {
                        include: {
                            sessions: true,
                            students: true,
                        }
                    },
                    questions: {
                        include: {
                            quizQuestion: true,
                        }
                    },
                }
            })
        }
    }
}