import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

export const Assignment = {
    typeDefs: gql`
        extend type Query {
            myAssignments: String
        }

        extend type Mutation {
            assignQuiz(
                quiz: String!,
                students: [String!], 
                groups: [String!], 
                start: DateTime!, 
                end: DateTime!
            ): QuizAssignment
        }
    `,
    queries: {},
    mutations: {
        assignQuiz: (_parent: any, args: { quiz: string, students?: string[], groups: string[], start: Date, end: Date }, context: Context) => {
            ProtectQuery(context, false);

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
                    students: {
                        connect: args.students.map(id => {
                            return {
                                id
                            };
                        })
                    },
                    groups: {
                        connect: args.groups.map(id => {
                            return {
                                id
                            };
                        })
                    },
                    start: args.start,
                    end: args.end,
                }
            });
        }
    },
}