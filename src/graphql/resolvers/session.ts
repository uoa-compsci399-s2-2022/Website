import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

export const Session = {
    typeDefs: gql`
        extend type Query {
            sessions(assignment: String!): [QuizSession!]!
        }

        extend type Mutation {
            createSession(assignment: String!): QuizSession
            setState(id: String!, state: JSON!): QuizSession
            pushEvent(id: String!, event: JSON!): QuizSession
            changeAnswer(id: String!, answer: JSON!): QuizSession
            finishSession(id: String!): QuizSession
            gradeSession(id: String!): Int
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
            })
        },
        /*
            setState(id: String!, state: JSON!): QuizSession
            pushEvent(id: String!, event: JSON!): QuizSession
            changeAnswer(id: String!, answer: JSON!): QuizSession
            finishSession(id: String!): QuizSession
            gradeSession(id: String!): Int
        */
    },
}