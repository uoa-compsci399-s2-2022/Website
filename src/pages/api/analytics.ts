/*
 * This API route handles analytics for our quizzes.  It should compile
 * a classes attempts at their assigned quizzes, finding stats like:
 * Average time taken
 * Average questions correct
 * Average questions attempted
 * etc.
 * On either the whole class, or a subset (e.g., how individual groups performed)
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