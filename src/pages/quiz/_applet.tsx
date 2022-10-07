/**
 * The 'QuizApplet' component enables students to take tests.
 **/
import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Quiz, QuizQuestionLink, QuizQuestion, QuizAssignment } from '@prisma/client';
import { DescriptionQuestion } from '@/components/question/description';
import { MultiChoiceQuestion } from '@/components/question/multichoice';
import { GetQuestionQuery } from './preview/[questionid]';
import Button from '@/components/button';

export const GetQuizNoAnswersQuery = gql`
    query($id: String!) {
        quizNoAnswers(id: $id) {
            id
            name
            description
            timeLimit
            questions {
                id
                index
                timeLimit
                quizQuestion {
                    id
                    type
                    category
                    name
                    content
                    attribution
                }
            }
        }
    }
`;

interface QuestionViewProps {
    question: QuizQuestion
}

const QuestionView: React.FC<QuestionViewProps> = ({ question }) => {
    let content = (<></>);

    switch (question.type) {
        case 'description': {
            content = <DescriptionQuestion content={question.content} />;
            break;
        };
        case 'multichoice': {
            content = <MultiChoiceQuestion content={question.content} />;
            break;
        };
        case 'numerical': {

        };
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {question && <>
                <div className="rounded-lg bg-slate-600 m-4">
                    <h1 className="text-white text-3xl p-6 text-center">
                        {
                            question.name
                        }
                    </h1>
                    {content}
                </div>
            </>}
        </div>
    );
}

type AppletStates = 'start' | 'in-quiz' | 'finish';

interface QuizAppletProps {
    id: string,
}

const QuizApplet: React.FC<QuizAppletProps> = ({ id }) => {
    const [appletState, setAppletState] = useState<AppletStates>('in-quiz');
    const [question, setQuestion] = useState(0);
    const { data } = useQuery(GetQuizNoAnswersQuery, {
        variables: {
            id
        }
    });

    const quiz = data.quizNoAnswers as Quiz & {
        questions: (QuizQuestionLink & {
            quizQuestion?: QuizQuestion
        })[],
        assignments: QuizAssignment[],
    };

    return <>
        <div className="p-4">
            <div>
                <QuestionView question={quiz.questions[question].quizQuestion} />
            </div>
            <div className="flex items-center justify-center gap-4">
                <Button
                    action={() => {
                        setQuestion(question => question - 1)
                    }}
                    disabled={question <= 0}
                    theme='solid'
                >
                    &lt;
                </Button>
                <p className="text-center text-white text-lg">
                    {
                        question + 1
                    }
                </p>
                <Button
                    action={() => {
                        setQuestion(question => question + 1)
                    }}
                    disabled={question >= quiz.questions.length - 1}
                    theme='solid'
                >
                    &gt;
                </Button>
            </div>
        </div>
    </>
}

export default QuizApplet