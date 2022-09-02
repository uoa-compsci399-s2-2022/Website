/**
 * Quiz card
 **/
import React, { Component, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { Quiz } from '@/pages/_student';

interface QuizCardProps {
    quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({quiz}) => {
    return (
            <div>
                <h5 className="mt-4 text-xl font-bold text-text-colour">{quiz.name}</h5>

                <p className="mt-2 text-sm sm:block">
                    <span className='block'>Available: {quiz.start_date.toDateString()}</span>
                    <span className='block'>Due: {quiz.end_date.toDateString()}</span> 
                </p>

                <p className='hidden mt-2 text-sm sm:block text-accent'>
                    Description of quiz
                </p>
            </div>
    )
}

export default QuizCard