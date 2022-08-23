/**
 * The 'Quiz' route allows students to take a quiz with '_applet.tsx'.  If an instructor visits this page,
 * then they should be able to modify the contents of this quiz using '_editor.tsx'.
 **/
import { isStudent } from '@/lib/util'
import { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import QuizApplet from './_applet'
import QuizEditor from './_editor'

const Quiz: NextPage = () => {
    const router = useRouter()
    const { quizid } = router.query
    const { data: session, status } = useSession()
    const loading = status === "loading";

    // Pull data about our quiz in from the server here, then provide it to the applet or
    // the editor.

    return <>
        <p>Quiz: {quizid}</p>
        {
            session && isStudent(session) ? <QuizApplet /> : <QuizEditor />
        }
    </>
}

export default Quiz