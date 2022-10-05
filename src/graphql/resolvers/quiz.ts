import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

export const Quiz = {
    typeDefs: gql`
        extend type Query {
            quiz(id: String!): Quiz
            quizzes: [Quiz!]!
            quizSessions: [QuizSession!]!
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

            updateQuizQuestion(
                linkId: String!,
                timeLimit: Int,
                questionId: String,
            ): QuizQuestionLink

            addQuizQuestion(id: String!): Quiz
            removeQuizQuestion(id: String!, linkId: String!): Quiz
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
                        create: new Array(args.questions).fill(0).map((_, index) => {
                            return {
                                timeLimit: 0,
                                index,
                            }
                        })
                    }
                },
                include: {
                    assignments: {
                        include: {
                            sessions: true,
                            student: true,
                            group: true,
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
                            student: true,
                            group: true,
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

        updateQuizQuestion: (_parent: any, args: { linkId: string, questionId?: string, timeLimit?: number }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quizQuestionLink.update({
                where: {
                    id: args.linkId,
                },
                data: {
                    quizQuestionId: args.questionId,
                    timeLimit: args.timeLimit,
                },
                include: {
                    quiz: true,
                    quizQuestion: true,
                }
            })
        },

        addQuizQuestion: async (_parent: any, args: { id: string }, context: Context) => {
            ProtectQuery(context, false);

            const prismaQuiz = await context.prisma.quiz.findFirst({
                where: {
                    id: args.id,
                },
                include: {
                    questions: true,
                }
            });

            if (!prismaQuiz) {
                throw new Error(`Quiz with id ${args.id} does not exist!`);
            }



            return await context.prisma.quiz.update({
                where: {
                    id: args.id,
                },
                data: {
                    questions: {
                        create: {
                            timeLimit: 0,
                            index: prismaQuiz.questions.length,
                        }
                    }
                },
                include: {
                    assignments: {
                        include: {
                            sessions: true,
                            student: true,
                            group: true,
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

        removeQuizQuestion: (_parent: any, args: { id: string, linkId: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quiz.update({
                where: {
                    id: args.id,
                },
                data: {
                    questions: {
                        delete: {
                            id: args.linkId,
                        }
                    }
                },
                include: {
                    assignments: {
                        include: {
                            sessions: true,
                            student: true,
                            group: true,
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
    }
}