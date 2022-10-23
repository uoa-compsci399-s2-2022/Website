interface StudentProps {
    name: string,
    passcode: string,
    email?: string,
}

interface UserProps {
    id: string,
    name: string,
    email?: string,
}

interface ClassProps {
    id: string,
    name: string,
    textid: string,
    students: StudentProps[]
    users: UserProps[],
};

interface GroupProps {
    id: string,
    name: string,
    passcode: string,
    anonymous: boolean,
    students: StudentProps[],
    classId: string,
};

interface QuizProps {
    id?: string,
    name: string,
    description: string,
    timeLimit: number,
    questions: QuizQuestionLinkProps[],
}

interface QuizQuestionLinkProps {
    timeLimit: number,
    index: number,
    quizQuestion: QuizQuestionProps,
}

interface QuizQuestionProps {
    id?: string,
    name: string,
    type: string,
    category: string,
    content: any,
    attribution: string,
}

type ImportedStudent = {
    name: string,
    passcode: string,
    email?: string,
}