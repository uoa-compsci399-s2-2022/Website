import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

export const Assignment = {
    typeDefs: gql`
        extend type Query {
            upcomingQuizzes: [QuizAssignment!]!
            previousQuizzes: [QuizAssignment!]!
        }

        extend type Mutation {
            assignQuiz(
                quiz: String!,
                student: String, 
                group: String, 
                start: DateTime!, 
                end: DateTime!
            ): QuizAssignment
        }
    `,
    queries: {
        upcomingQuizzes: (_parent: any, _arg: any, context: Context) => {
            ProtectQuery(context, true);

            let findParams = {}
            if (context.session.user.group) {
                findParams = {
                    groupId: context.session.user.uid,
                };
            } else {
                findParams = {
                    studentId: context.session.user.uid,
                };
            }

            return context.prisma.quizAssignment.findMany({
                where: {
                    end: {
                        gte: new Date(),
                    },
                    ...findParams,
                },
                include: {
                    quiz: true,
                    assignedBy: true,
                    sessions: true,
                }
            });
        },

        previousQuizzes: (_parent: any, _arg: any, context: Context) => {
            ProtectQuery(context, true);

            let findParams = {}
            if (context.session.user.group) {
                findParams = {
                    groupId: context.session.user.uid,
                };
            } else {
                findParams = {
                    studentId: context.session.user.uid,
                };
            }

            return context.prisma.quizAssignment.findMany({
                where: {
                    end: {
                        lt: new Date(),
                    },
                    ...findParams,
                },
                include: {
                    quiz: true,
                    assignedBy: true,
                    sessions: true,
                }
            });
        }
    },
    mutations: {
        assignQuiz: (_parent: any, args: { quiz: string, student?: string, group?: string, start: Date, end: Date }, context: Context) => {
            ProtectQuery(context, false);

            if (!args.student && !args.group) {
                throw new Error('Please assign this quiz to a student or a group');
            }
            if (args.student && args.group) {
                throw new Error("Please assign this quiz to either a student OR a quiz");
            }

            let creationConnection: any = {};

            if (args.student) {
                creationConnection = {
                    student: {
                        connect: {
                            id: args.student
                        }
                    }
                };
            } else if (args.group) {
                creationConnection = {
                    group: {
                        connect: {
                            id: args.group
                        }
                    },
                };
            }

            return context.prisma.quizAssignment.create({
                data: {
                    quiz: {
                        connect: {
                            id: args.quiz,
                        }
                    },
                    assignedBy: {
                        connect: {
                            id: context.session.user.uid,
                        }
                    },
                    start: args.start,
                    end: args.end,
                    ...creationConnection,
                }
            });
        }
    },
}