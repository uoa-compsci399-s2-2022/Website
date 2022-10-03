import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

export const Group = {
    typeDefs: gql`
        extend type Mutation {
            updateGroup(id: String!, name: String, anonymous: Boolean, passcode: String, students: [String!]): Group
        }
    `,
    queries: {},
    mutations: {
        updateGroup: async (_parent: any, args: { id: string, name?: string, anonymous?: boolean, passcode?: string, students?: string[] }, context: Context) => {
            ProtectQuery(context, false);

            const existing = await context.prisma.group.findFirst({
                where: {
                    id: args.id,
                },
                include: {
                    students: true,
                }
            });
            if (existing === null) {
                throw new Error(`Class with id ${args.id} not found.`);
            }

            const toConnect: string[] = [];
            const toRemove: string[] = [];

            const existingStudents = existing.students.map(student => student.id);

            if (args.students) {
                for (const student of existing.students) {
                    if (!(args.students.includes(student.id))) {
                        toRemove.push(student.id);
                    }
                }
                for (const id of args.students) {
                    if (!(existingStudents.includes(id))) {
                        toConnect.push(id);
                    }
                }
            }

            if (args.passcode) {
                let prismaStudent = await context.prisma.student.findFirst({
                    where: {
                        passcode: args.passcode
                    }
                });

                if (prismaStudent !== null) {
                    throw new Error(`Updated group conflicts with student ${prismaStudent.name} (passcode ${args.passcode})`);
                }

                let prismaGroup = await context.prisma.group.findFirst({
                    where: {
                        passcode: args.passcode
                    }
                });

                if (prismaGroup !== null && prismaGroup.id !== args.id) {
                    throw new Error(`Updated group conflicts with group ${prismaGroup.name} (passcode ${args.passcode})`);
                }
            }

            return await context.prisma.group.update({
                where: {
                    id: args.id,
                },
                data: {
                    name: args.name,
                    anonymous: args.anonymous,
                    passcode: args.passcode,
                    students: {
                        connect: toConnect.map(id => {
                            return {
                                id,
                            }
                        }),
                        disconnect: toRemove.map(id => {
                            return {
                                id,
                            }
                        }),
                    }
                },
                include: {
                    students: true,
                }
            });
        },
    }
}