import { Class, PrismaClient, Student, User } from '@prisma/client';

export const userToProps = (user: User): UserProps => {
    return {
        id: user.id,
        name: user.name ?? 'anonymous',
        email: user.email ?? undefined,
    }
};

export const studentToProps = (student: Student): StudentProps => {
    return {
        name: student.name,
        passcode: student.passcode,
        email: student.email ?? undefined,
    };
};

export const classToProps = (prismaClass: Class & { students: Student[], users: User[] }): ClassProps => {
    return {
        id: prismaClass.id,
        name: prismaClass.name,
        textid: prismaClass.textid,
        students: prismaClass.students.map((prismaStudent) => studentToProps(prismaStudent)),
        users: prismaClass.users.map((prismaUser) => userToProps(prismaUser)),
    };
};

const prisma = new PrismaClient();

export default prisma;