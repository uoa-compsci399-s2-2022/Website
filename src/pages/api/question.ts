/*
 * This API route handles quiz question creation.  This includes providing
 * questions to the client in subsets (categories)
 */
import prisma, { questionToProps } from '@/lib/prisma';
import { isStudent } from '@/lib/util';
import { QuizQuestion } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '16mb' // Set desired value here
        }
    }
}

export interface QuestionUpdate {
    id: string,
    type?: string,
    category?: string,
    content?: any,
    attribution?: string,
};

interface Data {
    error?: string
    message?: string,
    questions?: QuizQuestionProps[],
    question?: QuizQuestionProps,
}

const createQuestion = async (question: QuizQuestionProps, id: string): Promise<string | QuizQuestion> => {
    if (!question.type) {
        return 'Question requires "type"';
    }
    if (!question.category) {
        return 'Question requires "category"';
    }
    if (!question.content) {
        return 'Question requires "content"';
    }

    const prismaQuestion = await prisma.quizQuestion.create({
        data: {
            user: {
                connect: {
                    id
                }
            },
            ...question
        }
    });

    if (!prismaQuestion) {
        return 'Failed to create question';
    }
    return prismaQuestion;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const session = await unstable_getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        res.status(403).json({ error: "Must be logged in" });
        return;
    }

    switch (req.method) {
        case 'GET': {
            const { id } = req.query as {
                id?: string
            };

            if (!id) {
                if (isStudent(session)) {
                    res.status(403).json({ error: "Must be logged in as instructor" });
                    return;
                }
                const questions = await prisma.quizQuestion.findMany({
                    where: {
                        userId: session.user.uid,
                    }
                });
                res.status(200).json({
                    questions: questions.map(prismaQuestion => questionToProps(prismaQuestion))
                });
                return;
            }

            const question = await prisma.quizQuestion.findFirst({
                where: {
                    id
                }
            });
            if (question === null) {
                res.status(404).json({
                    error: `Question with id ${id} not found`
                });
                return;
            }
            res.status(200).json({
                question: questionToProps(question)
            });
            return;
        };
        case 'POST': {
            if (Array.isArray(req.body)) {
                const questions = req.body as QuizQuestionProps[];

                const results: QuizQuestion[] = [];
                for (const question of questions) {
                    const ret = await createQuestion(question, session.user.uid);
                    if (typeof ret === 'string') {
                        res.status(400).json({ error: ret });
                        return;
                    } else {
                        results.push(ret);
                    }
                }
                res.status(200).json({
                    questions: results.map(q => questionToProps(q))
                });
            } else {
                const question = req.body as QuizQuestionProps;

                const ret = await createQuestion(question, session.user.uid);
                if (typeof ret === 'string') {
                    res.status(400).json({ error: ret });
                } else {
                    res.status(200).json({
                        question: questionToProps(ret)
                    });
                }
            }
            return;
        };
        case 'PUT': {
            const { id, ...update } = req.body as QuestionUpdate;
            if (!id) {
                res.status(400).json({
                    error: 'Please include an "id" parameter in the request body'
                });
            }

            const updatedQuestion = await prisma.quizQuestion.update({
                where: {
                    id
                },
                data: {
                    ...update
                }
            });

            res.status(200).json({ question: questionToProps(updatedQuestion) });
            return;
        };
        case 'DELETE': {
            const { id } = req.query as {
                id?: string,
            };
            if (!id) {
                res.status(400).json({
                    error: 'Please include an "id" parameter in the request parameters'
                });
                return;
            }
            const deletedQuestion = await prisma.quizQuestion.delete({
                where: {
                    id
                }
            });
            if (deletedQuestion) {
                res.status(200).json({ message: 'Done' });
            } else {
                res.status(404).json({ error: 'Question not found' });
            }
            return;
        };
    }
    res.status(500).json({ error: `Invalid request method ${req.method}` });
}