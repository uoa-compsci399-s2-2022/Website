import React, { Dispatch, SetStateAction, useState } from "react";
import { LoadingSpinner } from '../loading';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Modal } from '../modal';
import { QuestionView } from "../question/question_view";
import { GetQuestionsQuery } from "@/pages/quiz/list";
import { QuizQuestion, User } from "@prisma/client";
import { Field, Form, Formik } from 'formik';
import Button from '../button';

const UpdateQuizQuestionMutation = gql`
    mutation($linkId: String!, $questionId: String, $timeLimit: Int, $index: Int) {
        updateQuizQuestion(linkId: $linkId, questionId: $questionId, timeLimit: $timeLimit, index: $index) {
            id
        }
    }
`;

interface QuestionAssignerProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
    linkId: string,
    description: string,
    initialValues: FormValues,
}

interface FormValues {
    questionId: string,
    timeLimit: number,
    index: number,
    questionName: string,
}

export const QuestionAssigner: React.FC<QuestionAssignerProps> = ({ isOpen, setIsOpen, doRefetch, linkId, description, initialValues }) => {
    const [updateQuizQuestion] = useMutation(UpdateQuizQuestionMutation);
    const { data: questionData, loading: questionsLoading } = useQuery(GetQuestionsQuery);
    const [questionSearch, setQuestionSearch] = useState('');

    const questions = questionsLoading ? [] : questionData.questions as (QuizQuestion & {
        user: User,
    })[];

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            title={`Assign Question ${description}`}
        >
            <Formik
                initialValues={initialValues}
                onSubmit={async ({ questionId, timeLimit, index }, { setSubmitting, setStatus }) => {
                    setSubmitting(true);
                    try {
                        await updateQuizQuestion({
                            variables: {
                                linkId,
                                questionId,
                                timeLimit,
                                index,
                            }
                        });
                        doRefetch();
                        setIsOpen(false);
                        setSubmitting(false);
                    } catch (error) {
                        console.log(error);
                        setStatus({
                            submitError: error.toString()
                        });
                        setSubmitting(false);
                    }
                }}
            >
                {({ setFieldValue, isSubmitting, isValid, status }) => (
                    <Form className="flex flex-col gap-2">
                        <label htmlFor="questionName" className="text-white">
                            Select question
                        </label>
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
                                    setFieldValue('questionId', question.id);
                                    setFieldValue('questionName', question.name);
                                }}
                            />
                        }
                        <Field
                            type="text"
                            className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black bg-white"
                            name="questionName"
                            id="questionName"
                            disabled={true}
                            placeholder="No question selected"
                        />
                        <div className="flex flex-col gap-1">
                            <label htmlFor="timeLimit">
                                Time limit
                            </label>
                            <Field
                                id="timeLimit"
                                className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                                name="timeLimit"
                                type="number"
                            />
                            <p>Enter a time limit in minutes, or 0 for no time limit.</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="index">
                                Index
                            </label>
                            <Field
                                id="index"
                                className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                                name="index"
                                type="number"
                            />
                        </div>

                        <div className="flex gap-2 items-center">
                            <Button theme='solid' action={() => { }} disabled={isSubmitting || !isValid}>
                                Save
                            </Button>
                            <Button action={() => setIsOpen(false)} preventDefault={true}>Cancel</Button>
                            {isSubmitting && <LoadingSpinner colour="black" />}
                            {status && status.submitError && <span className="text-red-500">{'Server error: ' + status.submitError}</span>}
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
};