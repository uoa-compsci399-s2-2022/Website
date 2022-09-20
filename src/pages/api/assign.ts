/*
 * This API route handles quiz assignment to groups and individual
 * students.
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