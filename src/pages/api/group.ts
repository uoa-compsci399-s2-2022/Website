/*
 * This API route allows for creating, reading, updating and
 * deleting groups in a class.
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