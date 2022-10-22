import { gql } from 'apollo-server-micro';
import { Context } from '@/pages/api/graphql';
import { ProtectQuery } from '../resolvers';
import { questionGrade } from '@/components/question/question_type';

interface Stat {
    id: string,
    name: string,
    average: number,
}

type StatsData = {
    type: 'class'
    quizzes: Record<string, Stat>,
} | {
    type: 'quiz'
    questions: Record<string, Stat>,
    results: Record<string, Record<string, number>>,
};

const safeDiv = (a: number, b: number): number => {
    if (b === 0) return 0;
    return a / b;
}

export interface StatsResult {
    id: string,
    completed: number,
    assigned: number,
    averageGrade: number,
    data: StatsData,
}

export const Statistics = {
    typeDefs: gql`
        type StatsResult {
            id: String!
            completed: Int!
            assigned: Int!
            averageGrade: Float!
            data: JSON!
        }

        extend type Query {
            classStatistics(classId: String!): StatsResult!
            quizStatistics(classId: String!, quizId: String!): StatsResult!
        }
    `,
    queries: {
        classStatistics: async (_parent: any, arg: { classId: string }, context: Context) => {
            ProtectQuery(context, false);

            let completed = 0;
            let assigned = 0;
            let gradeSum = 0;

            const assignments = await context.prisma.quizAssignment.findMany({
                where: {
                    class: {
                        id: arg.classId,
                    }
                },
                include: {
                    quiz: {
                        include: {
                            questions: {
                                include: {
                                    quizQuestion: true,
                                }
                            }
                        }
                    },
                    sessions: true,
                }
            });

            const quizData: Record<string, {
                quizId: string,
                quizName: string,
                gradeSum: number,
                completed: number,
            }> = {};

            for (const assignment of assignments) {
                assigned += 1;
                if (assignment.sessions.length > 1) {
                    assigned += assignment.sessions.length - 1;
                }

                for (const session of assignment.sessions) {
                    if (session.finish) {
                        completed += 1;

                        let grade = 0;
                        let graded = 0;
                        const answers = (session.data as any as QuizSessionData).answers;

                        for (let i = 0; i < assignment.quiz.questions.length; i++) {
                            const question = assignment.quiz.questions[i].quizQuestion;
                            if (question) {
                                const questionGradeResult = questionGrade(question, answers[`${question.id}`]);
                                if (questionGradeResult !== undefined) {
                                    grade += questionGradeResult / 100;
                                    graded += 1;
                                }
                            }
                        }

                        let score = grade / graded;
                        gradeSum += score;

                        const quizId = assignment.quizId;
                        if (quizId in quizData) {
                            quizData[quizId].completed += 1;
                            quizData[quizId].gradeSum += score;
                        } else {
                            quizData[quizId] = {
                                quizId,
                                quizName: assignment.quiz.name,
                                gradeSum: score,
                                completed: 1,
                            }
                        }
                    }
                }
            }

            const data: StatsData = {
                type: 'class',
                quizzes: {},
            };

            for (const quizId in quizData) {
                data.quizzes[quizId] = {
                    id: quizData[quizId].quizId,
                    name: quizData[quizId].quizName,
                    average: safeDiv(quizData[quizId].gradeSum, quizData[quizId].completed),
                }
            }

            const result: StatsResult = {
                id: arg.classId,
                completed,
                assigned,
                averageGrade: safeDiv(gradeSum, completed),
                data,
            };

            return result;
        },

        quizStatistics: async (_parent: any, arg: { quizId: string, classId: string, }, context: Context) => {
            ProtectQuery(context, false);

            let completed = 0;
            let assigned = 0;
            let gradeSum = 0;

            const assignments = await context.prisma.quizAssignment.findMany({
                where: {
                    class: {
                        id: arg.classId,
                    },
                    quiz: {
                        id: arg.quizId,
                    },
                },
                include: {
                    quiz: {
                        include: {
                            questions: {
                                include: {
                                    quizQuestion: true,
                                }
                            }
                        }
                    },
                    sessions: {
                        include: {
                            student: true,
                            group: true,
                        }
                    },
                }
            });

            const questionData: Record<string, {
                id: string,
                name: string,
                grade: number,
                completed: number,
            }> = {};

            const results: Record<string, Record<string, number>> = {};

            for (const assignment of assignments) {
                assigned += 1;
                if (assignment.sessions.length > 1) {
                    assigned += assignment.sessions.length - 1;
                }

                for (const session of assignment.sessions) {
                    if (session.finish) {
                        let resultId = '';
                        if (session.student) {
                            resultId = `Student ${session.student.name}`;
                        } else {
                            resultId = `Group ${session.group.name} (${session.id})`;
                        }
                        results[resultId] = {};

                        completed += 1;

                        let grade = 0;
                        let graded = 0;
                        const answers = (session.data as any as QuizSessionData).answers;

                        for (let i = 0; i < assignment.quiz.questions.length; i++) {
                            const question = assignment.quiz.questions[i].quizQuestion;
                            if (question) {
                                const questionGradeResult = questionGrade(question, answers[`${question.id}`]);
                                if (questionGradeResult !== undefined) {
                                    grade += questionGradeResult / 100;
                                    graded += 1;
                                    results[resultId][question.id] = grade;

                                    const questionId = question.id;
                                    if (questionId in questionData) {
                                        questionData[questionId].completed += 1;
                                        questionData[questionId].grade += questionGradeResult / 100;
                                    } else {
                                        questionData[questionId] = {
                                            id: questionId,
                                            name: question.name,
                                            grade: questionGradeResult / 100,
                                            completed: 1,
                                        }
                                    }
                                }

                            }
                        }

                        let score = grade / graded;
                        gradeSum += score;
                    }
                }
            }

            const data: StatsData = {
                type: 'quiz',
                questions: {},
                results,
            };

            for (const questionId in questionData) {
                data.questions[questionId] = {
                    id: questionData[questionId].id,
                    name: questionData[questionId].name,
                    average: safeDiv(questionData[questionId].grade, questionData[questionId].completed),
                }
            }

            const result: StatsResult = {
                id: arg.quizId,
                completed,
                assigned,
                averageGrade: safeDiv(gradeSum, completed),
                data,
            };

            return result;
        },
    }
}