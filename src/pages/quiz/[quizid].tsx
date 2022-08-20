/**
 * The 'Quiz' route allows students to take a quiz with '_applet.tsx'.  If an instructor visits this page,
 * then they should be able to modify the contents of this quiz using '_editor.tsx'.
 **/
import { NextPage } from 'next'
import { useRouter } from 'next/router'

const Quiz: NextPage = () => {
    const router = useRouter()
    const { quizid } = router.query

    // Pull data about our quiz in from the server here, then provide it to the applet or
    // the editor.

    return <p>Quiz: {quizid}</p>
}

export default Quiz