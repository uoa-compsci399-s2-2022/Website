import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

interface StudentInput {
    name: string,
    passcode: string,
    email?: string,
}

export const Student = {
    typeDefs: gql`
        extend type Mutation {
            findOrCreateStudent(name: String!, passcode: String!, email: String): Student
            updateStudent(id: String!, name: String, passcode: String, email: String): Student
            deleteStudent(id: String!): Student
        }
    `,
    queries: {},
    mutations: {
        findOrCreateStudent: async (_parent: any, args: StudentInput, context: Context) => {
            ProtectQuery(context, false);

            let prismaGroup = await context.prisma.group.findFirst({
                where: {
                    passcode: args.passcode
                }
            });
            if (prismaGroup !== null) {
                throw new Error(`Student ${args.name} conflicts with group ${prismaGroup.name} (passcode ${args.passcode})`);
            }

            let prismaStudent = await context.prisma.student.findFirst({
                where: {
                    passcode: args.passcode
                }
            });
            if (prismaStudent === null) {
                // create a new student
                prismaStudent = await context.prisma.student.create({
                    data: {
                        name: args.name,
                        passcode: args.passcode,
                        email: args.email,
                    }
                });
            } else if (prismaStudent.name !== args.name
                || prismaStudent.passcode !== args.passcode
                || (prismaStudent.email ?? undefined) !== args.email) {
                throw new Error(`Student ${args.name} (passcode: ${args.passcode}) conflicts with existing student.`);
            }
            return prismaStudent;
        },

        updateStudent: async (_parent: any, args: { id: string, name?: string, passcode?: string, email?: string }, context: Context) => {
            ProtectQuery(context, false);

            if (args.passcode) {
                // if we are changing the passcode, lets ensure that it is unique
                let prismaGroup = await context.prisma.group.findFirst({
                    where: {
                        passcode: args.passcode
                    }
                });
                if (prismaGroup !== null) {
                    throw new Error(`Student ${args.name} conflicts with group ${prismaGroup.name} (passcode ${args.passcode})`);
                }

                let prismaStudent = await context.prisma.student.findFirst({
                    where: {
                        passcode: args.passcode
                    }
                });
                if (prismaStudent !== null) {
                    throw new Error(`Student ${args.name} conflicts with student ${prismaStudent.name} (passcode ${args.passcode})`);
                }
            }

            return await context.prisma.student.update({
                where: {
                    id: args.id,
                },
                data: {
                    name: args.name,
                    passcode: args.passcode,
                    email: args.email,
                }
            });
        },

        deleteStudent: (_parent: any, args: { id: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.student.delete({
                where: {
                    id: args.id,
                },
            });
        }
    }
};