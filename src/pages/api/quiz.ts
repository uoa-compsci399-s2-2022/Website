/*
 * This API route handles quiz creation.  It will also enable students
 * to take quizzes (e.g., creating QuizSession in our database)
 */
import { NextApiRequest, NextApiResponse } from 'next';

interface Data {
    error?: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    res.status(500).json({ error: 'unimplemented' });
}