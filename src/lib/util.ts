import { Session } from "next-auth"

export const isStudent = (session?: Session): boolean => {
    return (session && session.user && 'student' in session.user) ?? false;
}