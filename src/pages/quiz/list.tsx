/**
 * The 'QuizList' route should show instructors every quiz they have access to.
 **/
import { NextPage } from 'next'
import { useState } from 'react';
import Card, { CardContainer } from '@/components/card';
import QuizCard from '@/components/quiz_card';
import { QuizCreator } from '@/components/quiz_creator';

const QuizList: NextPage = () => {
    const [quizCreatorOpen, setQuizCreatorOpen] = useState(false);

    return (
        <main>
            <h1 className="text-white text-3xl p-6">
                your quizzes
            </h1>
            <CardContainer>
                {
                    [].map((data) => {
                        return (
                            <QuizCard quiz={data} key={data}></QuizCard>
                        );
                    })
                }
                <Card onClick={() => setQuizCreatorOpen(true)}>
                    <h1 className="mt-4 text-xl font-bold text-text-colour w-full text-center">create new quiz</h1>
                </Card>
            </CardContainer>

            <QuizCreator
                isOpen={quizCreatorOpen}
                setIsOpen={setQuizCreatorOpen}
            />
        </main>
    );
}

export default QuizList