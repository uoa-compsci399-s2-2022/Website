import { Student } from "@prisma/client";

export interface StudentProps {
    name: string,
    passcode: string,
    email?: string,
}

export const studentToProps = (student: Student): StudentProps => {
    return {
        name: student.name,
        passcode: student.passcode,
        email: student.email ?? undefined,
    };
};