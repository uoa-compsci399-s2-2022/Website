/*
 * This API route handles quiz question creation.  This includes providing
 * questions to the client in subsets (categories)
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