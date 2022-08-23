/*
 * This API route does login for Students.  Here, we must generate a token for
 * a student's entered passcode.  This incldues anonymous group login, where
 * one password can represent many different students.
 */
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    error?: string,
} | any;

interface Body {
    passcode: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: "You must use POST for this request." });
        return;
    }
    if (typeof req.body['passcode'] !== 'string') {
        res.status(400).json({ error: "You must include a string 'passcode' with this request." });
        return;
    }

    const { passcode } = req.body as Body;

    const users = await prisma.student.findMany({
        where: { passcode },
    });

    if (users.length === 0) {
        res.status(404).json({ error: "User not found." });
    }

    if (users.length > 1) {
        res.status(400).json({ error: "Invalid passcode." });
    }

    const [user] = users;

    console.log(user);
    res.status(200).json(user);
}
