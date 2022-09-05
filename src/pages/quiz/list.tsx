/**
 * The 'QuizList' route should show instructors every quiz they have access to.
 **/
import { NextPage } from 'next'

const QuizList: NextPage = () => {
    return (
        <main>
            <h1 className="text-white text-3xl p-6">
                your quizzes
            </h1>
        </main>
    )
}

export default QuizList