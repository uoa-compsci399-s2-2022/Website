/**
 * The 'QuizEditor' component enables instructors to edit quizzes
 **/
import React from 'react'
import { useRouter } from 'next/router'

const QuizEditor: React.FC = () => {
    const router = useRouter()
    const { quizid } = router.query

    return <p>Quiz: {quizid}</p>
}

export default QuizEditor