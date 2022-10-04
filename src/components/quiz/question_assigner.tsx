import React, { Dispatch, SetStateAction, useState } from "react";
import { LoadingSpinner } from '../loading';
import { useMutation, useQuery } from '@apollo/client';
import { Modal } from '../modal';
import { QuestionView } from "../question/question_view";
import { GetQuestionsQuery } from "@/pages/quiz/list";
import { QuizQuestion, User } from "@prisma/client";
import { UpdateQuizQuestionMutation } from "@/pages/quiz/_editor";

interface QuestionAssignerProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
    linkId: string,
    description: string,
}

export const QuestionAssigner: React.FC<QuestionAssignerProps> = ({ isOpen, setIsOpen, doRefetch, linkId, description }) => {
    const [updateQuizQuestion] = useMutation(UpdateQuizQuestionMutation);
    const { data: questionData, loading: questionsLoading } = useQuery(GetQuestionsQuery);
    const [questionSearch, setQuestionSearch] = useState('');
    const [error, setError] = useState('');

    const questions = questionsLoading ? [] : questionData.questions as (QuizQuestion & {
        user: User,
    })[];

    const setQuestion = async (questionId: string) => {
        setError('');
        try {
            await updateQuizQuestion({
                variables: {
                    linkId,
                    questionId
                }
            });
            doRefetch();
            setIsOpen(false);
        } catch (error) {
            console.log(error);
            setError(error.toString());
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            title={`Assign Question ${description}`}
        >
            <input
                type='text'
                placeholder="Search"
                className="rounded p-2 my-2 w-full"
                onChange={(event) => {
                    setQuestionSearch(event.target.value);
                }}
            />
            <div className="pt-2">
                {
                    !questionsLoading && questions.length === 0 &&
                    <p className="text-white pb-4">{'You have no questions.'}</p>
                }
                {
                    questionsLoading && <p className="text-white pb-4 flex gap-2 items-center">
                        <LoadingSpinner /> Loading questions
                    </p>
                }
            </div>
            {
                !questionsLoading && questions.length > 0 &&
                <QuestionView
                    questions={questions}
                    selectMultiple={false}
                    query={questionSearch}
                    onSelect={(question) => {
                        setQuestion(question.id);
                    }}
                />
            }
            <p className="text-red">{error}</p>
        </Modal>
    )
};