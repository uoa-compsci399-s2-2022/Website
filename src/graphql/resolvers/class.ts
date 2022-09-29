import { Context } from '@/pages/api/graphql';
import { gql } from 'apollo-server-micro';
import { ProtectQuery } from '../resolvers';

interface GroupInput {
    name: string,
    passcode: string,
    students?: string[],
    anonymous?: boolean,
}

export const Class = {
    typeDefs: gql`
        extend type Query {
            class(id: String, textid: String): Class
            classes: [Class!]!
        }

        extend type Mutation {
            createClass(textid: String!, name: String!, students: [String!]): Class
            updateClass(id: String!, name: String, users: [String!]): Class
            deleteClass(id: String!): Class
            """
            addUsersToClass(id: String!, users: [String!]): Class
            removeUsersFromClass(id: String!, users: [String!]): Class
            """
            addStudentsToClass(id: String!, students: [String!]): Class
            removeStudentsFromClass(id: String!, students: [String!]): Class
            addGroupToClass(id: String!, group: GroupInput): Class
            removeGroupFromClass(id: String!, groupId: String!): Class
        }
    `,
    queries: {
        /*
         * class(id: String, textid: String): Class
         * classes: [Class!]!
         */
        class: (_parent: any, arg: { id?: string, textid?: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.class.findFirst({
                where: {
                    id: arg.id,
                    textid: arg.textid,
                    users: {
                        some: {
                            id: context.session.user.uid
                        }
                    }
                },
                include: {
                    students: true,
                    users: true,
                    groups: true,
                }
            });
        },
        classes: (_parent: any, _arg: any, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.class.findMany({
                where: {
                    users: {
                        some: {
                            id: context.session.user.uid
                        }
                    }
                },
                include: {
                    students: true,
                    users: true,
                    groups: true,
                }
            });
        },
    },
    mutations: {
        createClass: async (_parent: any, args: { textid: string, name: string, students?: string[] }, context: Context) => {
            ProtectQuery(context, false);

            const prismaClass = await context.prisma.class.findFirst({
                where: {
                    textid: args.textid,
                    users: {
                        some: {
                            id: context.session.user.uid
                        }
                    }
                },
            });

            if (prismaClass !== null) {
                throw new Error(`Class ${args.textid} already exists.`);
            }

            return await context.prisma.class.create({
                data: {
                    users: {
                        connect: {
                            id: context.session.user.uid
                        }
                    },
                    name: args.name,
                    textid: args.textid,
                    students: {
                        connect: (args.students ?? []).map((id) => {
                            return {
                                id
                            };
                        })
                    }
                },
                include: {
                    students: true,
                    users: true,
                    groups: true,
                }
            });
        },

        updateClass: async (_parent: any, args: { id: string, name?: string, users?: string[] }, context: Context) => {
            ProtectQuery(context, false);

            const existing = await context.prisma.class.findFirst({
                where: {
                    id: args.id,
                },
                include: {
                    users: true,
                }
            });
            if (existing === null) {
                throw new Error(`Class with id ${args.id} not found.`);
            }

            const toConnect: string[] = [];
            const toRemove: string[] = [];

            const existingUsers = existing.users.map(user => user.email);

            if (args.users) {
                for (const user of existing.users) {
                    if (!(args.users.includes(user.email))) {
                        toRemove.push(user.email);
                    }
                }
                for (const email of args.users) {
                    if (!(existingUsers.includes(email))) {
                        toConnect.push(email);
                    }
                }
            }

            return await context.prisma.class.update({
                where: {
                    id: args.id,
                },
                data: {
                    name: args.name,
                    users: {
                        connect: toConnect.map(email => {
                            return {
                                email,
                            }
                        }),
                        disconnect: toRemove.map(email => {
                            return {
                                email,
                            }
                        }),
                    }
                },
                include: {
                    users: true,
                    students: true,
                    groups: true,
                }
            });
        },

        deleteClass: (_parent: any, args: { id: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.class.delete({
                where: {
                    id: args.id,
                },
                include: {
                    users: true,
                    students: true,
                    groups: true,
                }
            });
        },

        /*
        addUsersToClass: (_parent: any, args: { id: string, users?: string[] }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.class.update({
                where: {
                    id: args.id
                },
                data: {
                    users: {
                        connect: (args.users ?? []).map((email) => {
                            return {
                                email
                            }
                        })
                    }
                },
                include: {
                    users: true,
                    students: true,
                    groups: true,
                }
            })
        },

        removeUsersFromClass: (_parent: any, args: { id: string, users?: string[] }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.class.update({
                where: {
                    id: args.id
                },
                data: {
                    users: {
                        deleteMany: (args.users ?? []).map((email) => {
                            return {
                                email
                            }
                        })
                    }
                },
                include: {
                    users: true,
                    students: true,
                    groups: true,
                }
            })
        },*/

        addStudentsToClass: (_parent: any, args: { id: string, students?: string[] }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.class.update({
                where: {
                    id: args.id
                },
                data: {
                    students: {
                        connect: (args.students ?? []).map((id) => {
                            return {
                                id
                            }
                        })
                    }
                },
                include: {
                    users: true,
                    students: true,
                    groups: true,
                }
            })
        },

        removeStudentsFromClass: (_parent: any, args: { id: string, students?: string[] }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.class.update({
                where: {
                    id: args.id
                },
                data: {
                    students: {
                        deleteMany: (args.students ?? []).map((id) => {
                            return {
                                id
                            }
                        })
                    }
                },
                include: {
                    users: true,
                    students: true,
                    groups: true,
                }
            })
        },

        addGroupToClass: async (_parent: any, args: { id: string, group: GroupInput }, context: Context) => {
            ProtectQuery(context, false);

            let prismaStudent = await context.prisma.group.findFirst({
                where: {
                    passcode: args.group.passcode
                }
            });
            if (prismaStudent !== null) {
                throw new Error(`Group ${args.group.name} conflicts with student ${prismaStudent.name} (passcode ${args.group.passcode})`);
            }

            return await context.prisma.class.update({
                where: {
                    id: args.id
                },
                data: {
                    groups: {
                        create: {
                            name: args.group.name,
                            passcode: args.group.passcode,
                            anonymous: args.group.anonymous ?? false,
                            students: {
                                connect: (args.group.students ?? []).map((id) => {
                                    return {
                                        id
                                    };
                                })
                            }
                        }
                    }
                },
                include: {
                    users: true,
                    students: true,
                    groups: true,
                }
            })
        },

        removeGroupFromClass: (_parent: any, args: { id: string, group: string }, context: Context) => {
            ProtectQuery(context, false);

            return context.prisma.class.update({
                where: {
                    id: args.id
                },
                data: {
                    groups: {
                        delete: {
                            id: args.group,
                        }
                    }
                },
                include: {
                    users: true,
                    students: true,
                    groups: true,
                }
            })
        },
    }
};