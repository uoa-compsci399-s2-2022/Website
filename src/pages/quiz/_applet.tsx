/**
 * The 'QuizApplet' component enables students to take tests.
 **/
import React from 'react'
import { useRouter } from 'next/router'

const QuizApplet: React.FC = () => {
    const router = useRouter()
    const { quizid } = router.query

    return <p>Quiz: {quizid}</p>
}

export default QuizApplet