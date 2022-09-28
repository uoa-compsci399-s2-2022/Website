import { questionRemoveAnswers } from '@/lib/util';
import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

export const Question = {
    typeDefs: gql`
        extend type Query {
            question(id: String!): QuizQuestion
            questions: [QuizQuestion!]!

            questionWithoutAnswers(id: String!): QuizQuestion
        }

        extend type Mutation {
            createQuestion(
                type: String!, 
                name: String!,
                category: String!, 
                content: JSON!, 
                attribution: String
            ): QuizQuestion
            updateQuestion(
                id: String!,
                name: String,
                type: String,
                category: String,
                content: JSON,
                attribution: String
            ): QuizQuestion
            deleteQuestion(id: String!): QuizQuestion
        }
    `,
    queries: {
        question: (_parent: any, arg: { id: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quizQuestion.findFirst({
                where: {
                    user: {
                        id: context.session.user.uid
                    },
                    id: arg.id,
                },
                include: {
                    quizLinks: {
                        include: {
                            quiz: true,
                        }
                    },
                    user: true,
                }
            });
        },

        questions: (_parent: any, _arg: any, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quizQuestion.findMany({
                where: {
                    user: {
                        id: context.session.user.uid
                    }
                },
                include: {
                    quizLinks: {
                        include: {
                            quiz: true,
                        }
                    },
                    user: true,
                }
            });
        },

        questionWithoutAnswers: async (_parent: any, args: { id: string }, context: Context) => {
            ProtectQuery(context, true);

            const question = await context.prisma.quizQuestion.findFirst({
                where: {
                    id: args.id,
                },
                include: {
                    user: true,
                }
            });

            return questionRemoveAnswers(question);
        },

    },
    mutations: {
        createQuestion: (_parent: any, args: { type: string, name: string, category: string, content: any, attribution?: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quizQuestion.create({
                data: {
                    user: {
                        connect: {
                            id: context.session.user.uid,
                        }
                    },
                    name: args.name,
                    type: args.type,
                    category: args.category,
                    content: args.content,
                    attribution: args.attribution,
                },
                include: {
                    quizLinks: {
                        include: {
                            quiz: true,
                        }
                    },
                    user: true,
                }
            });
        },

        updateQuestion: (_parent: any, args: { id: string, name?: string, type?: string, category?: string, content?: any, attribution?: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quizQuestion.update({
                where: {
                    id: args.id,
                },
                data: {
                    ...args,
                },
                include: {
                    quizLinks: {
                        include: {
                            quiz: true,
                        }
                    },
                    user: true,
                }
            })
        },

        deleteQuestion: (_parent: any, args: { id: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.quizQuestion.delete({
                where: {
                    id: args.id,
                },
                include: {
                    quizLinks: {
                        include: {
                            quiz: true,
                        }
                    },
                    user: true,
                }
            });
        }
    },
}