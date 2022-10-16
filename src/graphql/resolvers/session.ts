import { Prisma } from '@prisma/client';
import { gql } from 'apollo-server-micro';
import { questionGrade } from '@/components/question/question_type';
import { Context } from '@/pages/api/graphql';
import { ProtectQuery } from '../resolvers';

export const Session = {
    typeDefs: gql`
        type QuizGrade {
            grade: Float,
            graded: Float,
        }

        extend type Query {
            sessions(assignment: String!): [QuizSession!]!
            gradeSession(id: String!): QuizGrade
        }

        extend type Mutation {
            createSession(assignment: String!): QuizSession
            setState(id: String!, state: JSON!): QuizSession
            pushEvent(id: String!, event: JSON!): QuizSession
            changeAnswer(id: String!, key: String!, answer: JSON!): QuizSession
            finishSession(id: String!): QuizSession
        }
    `,
    queries: {
        sessions: (_parent: any, arg: { assignment: string }, context: Context) => {
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

            return context.prisma.quizSession.findMany({
                where: {
                    quizAssignment: {
                        id: arg.assignment,
                    },
                    ...findParams,
                },
            });
        },

        gradeSession: async (_parent: any, arg: { id: string }, context: Context) => {
            ProtectQuery(context, true);

            let grade = 0;
            let graded = 0;

            const session = await context.prisma.quizSession.findFirst({
                where: {
                    id: arg.id,
                },
                include: {
                    quizAssignment: {
                        include: {
                            quiz: {
                                include: {
                                    questions: {
                                        include: {
                                            quizQuestion: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!session) {
                throw new Error(`No such session with id ${arg.id}`);
            }

            const answers = (session.data as any as QuizSessionData).answers;

            for (let i = 0; i < session.quizAssignment.quiz.questions.length; i++) {
                const question = session.quizAssignment.quiz.questions[i].quizQuestion;
                if (question) {
                    const questionGradeResult = questionGrade(question, answers[`${question.id}`]);
                    if (questionGradeResult !== undefined) {
                        grade += questionGradeResult / 100;
                        graded += 1;
                    }
                }
            }

            return { grade, graded };
        },
    },
    mutations: {
        createSession: (_parent: any, arg: { assignment: string }, context: Context) => {
            ProtectQuery(context, true);

            let createParams = {}
            if (context.session.user.group) {
                createParams = {
                    group: {
                        connect: {
                            id: context.session.user.uid,
                        }
                    }
                };
            } else {
                createParams = {
                    student: {
                        connect: {
                            id: context.session.user.uid,
                        }
                    }
                };
            }

            return context.prisma.quizSession.create({
                data: {
                    quizAssignment: {
                        connect: {
                            id: arg.assignment,
                        }
                    },
                    ...createParams,
                    data: {
                        state: {},
                        events: {},
                        answers: {},
                    },
                }
            });
        },

        setState: async (_parent: any, args: { id: string, state: any }, context: Context) => {
            ProtectQuery(context, true);

            const existing = await context.prisma.quizSession.findFirst({
                where: {
                    id: args.id,
                }
            });

            if (!existing) {
                throw new Error(`No such session with id ${args.id}`);
            }

            return context.prisma.quizSession.update({
                where: {
                    id: args.id,
                },
                data: {
                    data: {
                        ...existing.data as Prisma.JsonObject,
                        state: args.state,
                    }
                }
            });
        },

        pushEvent: async (_parent: any, args: { id: string, event: any }, context: Context) => {
            ProtectQuery(context, true);

            const existing = await context.prisma.quizSession.findFirst({
                where: {
                    id: args.id,
                }
            });

            if (!existing) {
                throw new Error(`No such session with id ${args.id}`);
            }

            const existingData = existing.data as Prisma.JsonObject;

            const newData: any = {
                events: {
                    ...existingData.events as Prisma.JsonObject,
                }
            };
            newData.events[new Date().toISOString()] = args.event;

            return context.prisma.quizSession.update({
                where: {
                    id: args.id,
                },
                data: {
                    data: {
                        ...existingData,
                        ...newData,
                    }
                }
            });
        },

        changeAnswer: async (_parent: any, args: { id: string, key: string, answer: any }, context: Context) => {
            ProtectQuery(context, true);

            const existing = await context.prisma.quizSession.findFirst({
                where: {
                    id: args.id,
                }
            });

            if (!existing) {
                throw new Error(`No such session with id ${args.id}`);
            }

            const existingData = existing.data as Prisma.JsonObject;

            const newData: any = {
                answers: {
                    ...existingData.answers as Prisma.JsonObject
                }
            };
            newData.answers[args.key] = args.answer;

            return context.prisma.quizSession.update({
                where: {
                    id: args.id,
                },
                data: {
                    data: {
                        ...existingData,
                        ...newData,
                    }
                }
            });
        },

        finishSession: async (_parent: any, args: { id: string }, context: Context) => {
            ProtectQuery(context, true);

            return context.prisma.quizSession.update({
                where: {
                    id: args.id,
                },
                data: {
                    finish: new Date(),
                }
            });
        }
    },
}