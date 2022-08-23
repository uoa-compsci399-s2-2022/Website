import { Session } from "next-auth"

export const isStudent = (session?: Session): boolean => {
    return session !== undefined
        && session.user !== undefined
        && 'student' in session.user;
}