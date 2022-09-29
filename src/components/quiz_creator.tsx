import { GetQuizQuery } from '@/pages/quiz/_editor';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Dialog } from "@headlessui/react";
import { Quiz } from '@prisma/client';
import { Field, FieldArray, Form, Formik, useField, useFormik } from "formik";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "./button";
import { LoadingSpinner } from './loading';
import MarkdownField from './markdown_field';
import { Modal } from './modal';

const CreateQuizMutation = gql`
    mutation($name: String!, $description: String!, $questions: Int!, $timeLimit: Int!) {
        createQuiz(name: $name, description: $description, questions: $questions, timeLimit: $timeLimit) {
            id
        }
    }
`;

const UpdateQuizMutation = gql`
    mutation($id: String!, $name: String, $description: String, $timeLimit: Int) {
        updateQuiz(id: $id, name: $name, description: $description, timeLimit: $timeLimit) {
            id
        }
    }
`;

interface QuizCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    editor: boolean,
    doRefetch?: () => void,
    initialValues?: FormValues,
    id?: string,
}

interface FormValues {
    name: string,
    description: string,
    questions: number,
    timeLimit: number,
}

export const QuizCreator: React.FC<QuizCreatorProps> = ({ isOpen, setIsOpen, editor, doRefetch, initialValues, id }) => {
    const router = useRouter();
    const [createQuiz] = useMutation(CreateQuizMutation);
    const [updateQuiz] = useMutation(UpdateQuizMutation);
    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={`Quiz ${editor ? 'Editor' : 'Creator'}`}
        >
            <Formik
                initialValues={initialValues ?? { name: '', description: '', questions: 0, timeLimit: 30 } as FormValues}
                onSubmit={async ({ name, description, questions, timeLimit }, { setSubmitting, setStatus }) => {
                    try {
                        if (editor) {
                            await updateQuiz({
                                variables: {
                                    id,
                                    name,
                                    description,
                                    timeLimit,
                                }
                            });
                            doRefetch && doRefetch();
                            setIsOpen(false);
                        } else {
                            const result = await createQuiz({
                                variables: {
                                    name,
                                    description,
                                    questions,
                                    timeLimit,
                                }
                            });
                            const createdId = result.data.createQuiz.id;
                            router.push(`/quiz/${createdId}`);
                        }
                    } catch (error) {
                        setStatus({
                            submitError: error.toString(),
                        });
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, isValidating, isValid, setValues, status }) => {
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
                                <MarkdownField
                                    id="description"
                                    name="description"
                                />
                            </div>
                            {
                                !editor && (
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
                                )
                            }
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
                                <Button theme='solid' action={() => { }} disabled={loading || !isValid}>
                                    {editor ? 'Save' : 'Create'}
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