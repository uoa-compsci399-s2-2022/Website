/*
 * This API route does login for Students.  Here, we must generate a token for
 * a student's entered passcode.  This incldues anonymous group login, where
 * one password can represent many different students.
 */
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    token: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {

}
