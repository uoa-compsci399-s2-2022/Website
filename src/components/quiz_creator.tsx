import { gql, useMutation } from '@apollo/client';
import { Dialog } from "@headlessui/react";
import { Field, FieldArray, Form, Formik, useField } from "formik";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "./button";
import { LoadingSpinner } from './loading';
import { Modal } from './modal';

const CreateQuizMutation = gql`
    mutation($name: String!, $description: String!, $questions: Int!, $timeLimit: Int!) {
        createQuiz(name: $name, description: $description, questions: $questions, timeLimit: $timeLimit) {
            id
        }
    }
`;


interface QuizCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
}

interface FormValues {
    name: string,
    description: string,
    questions: number,
    timeLimit: number,
}

export const QuizCreator: React.FC<QuizCreatorProps> = ({ isOpen, setIsOpen }) => {
    const router = useRouter();
    const [createQuiz] = useMutation(CreateQuizMutation);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Quiz Creator"
        >
            <Formik
                initialValues={{ name: '', description: '', questions: 0, timeLimit: 30 } as FormValues}
                onSubmit={async ({ name, description, questions, timeLimit }, { setSubmitting, setStatus }) => {
                    try {
                        const result = await createQuiz({
                            variables: {
                                name,
                                description,
                                questions,
                                timeLimit,
                            }
                        });
                        console.log(result);
                        const createdId = result.data.createQuiz.id;
                        router.push(`/quiz/${createdId}`);
                    } catch (error) {
                        setStatus({
                            submitError: error.toString(),
                        });
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, isValidating, isValid, validateForm, status }) => {
                    const loading = isSubmitting || isValidating;
                    return (
                        <Form className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="name">
                                    Name
                                </label>
                                <Field
                                    id="name"
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                                    name="name"
                                    type="text"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="content-description">
                                    Description (Uses <a className="text-blue-600" href="https://www.markdownguide.org/basic-syntax/" title="Markdown Format Basics">Markdown</a> format)
                                </label>
                                <Field
                                    component="textarea"
                                    rows="4"
                                    id="description"
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                                    name="description"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="questions">
                                    Questions
                                </label>
                                <Field
                                    id="questions"
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                                    name="questions"
                                    type="number"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="timeLimit">
                                    Time limit
                                </label>
                                <Field
                                    id="timeLimit"
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                                    name="timeLimit"
                                    type="number"
                                />
                            </div>


                            <div className="flex gap-2 items-center">
                                <Button solid={true} action={() => { }} disabled={loading || !isValid}>
                                    Continue
                                </Button>
                                <Button action={() => setIsOpen(false)} preventDefault={true}>Cancel</Button>
                                {loading && <LoadingSpinner colour="black" />}
                                {status && status.submitError && <span className="text-red-500">{'Server error: ' + status.submitError}</span>}
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </Modal>
    )
};