/**
 * Quiz card
 **/
import React, { Component, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { Quiz, QuizAssignment, QuizQuestion } from '@prisma/client';
import Card from '../card';

interface QuizCardProps {
    quiz: Quiz & {
        assignments?: QuizAssignment[],
        questions?: (QuizQuestion | null)[]
    };
    assignment?: QuizAssignment;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, assignment }) => {
    const assignments = quiz.assignments?.length;
    const questions = quiz.questions?.length;

    return (
        <Card url={`/quiz/${quiz.id}/`}>
            <h5 className="mt-4 text-xl font-bold text-text-colour">{quiz.name}</h5>

            <p className="mt-2 text-sm sm:block">
                {
                    assignment ? (
                        <>
                            <span className='block'>Available: {new Date(assignment.start).toLocaleString("en-NZ")}</span>
                            <span className='block'>Due: {new Date(assignment.end).toLocaleString("en-NZ")}</span>
                        </>
                    ) : (
                        <>
                            <span className='block'>{assignments} assignment{assignments !== 1 ? 's' : ''}</span>
                            <span className='block'>{questions} question{questions !== 1 ? 's' : ''}</span>
                        </>
                    )
                }
            </p>
        </Card>
    )
}

export default QuizCard