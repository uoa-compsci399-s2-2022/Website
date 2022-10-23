import { Field, Form, Formik, useField } from "formik";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "../button";
import { LoadingSpinner } from '../loading';
import { gql, useMutation } from '@apollo/client';
import { Modal } from '../modal';
import { validateEmail, validateNonEmpty } from '@/lib/validation';

const UpdateStudentMutation = gql`
    mutation($id: String!, $name: String, $passcode: String, $email: String) {
        updateStudent(id: $id, name: $name, passcode: $passcode, email: $email) {
            id
        }
    }
`;

interface StudentEditorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
    id: string,
    initialProps: FormValues
}

interface FormValues {
    student: ImportedStudent,
}

export const StudentEditor: React.FC<StudentEditorProps> = ({ isOpen, setIsOpen, doRefetch, initialProps, id }) => {
    const [updateStudent] = useMutation(UpdateStudentMutation);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            title="Update Student"
        >
            <Formik
                initialValues={initialProps}
                onSubmit={async ({ student }, { setSubmitting, setStatus, setFieldError, resetForm }) => {
                    try {
                        await updateStudent({
                            variables: {
                                id,
                                ...student
                            }
                        });
                        resetForm();
                        setSubmitting(false);
                        setIsOpen(false);
                        doRefetch();
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
                                <label htmlFor="student.name">
                                    Name
                                </label>
                                <Field
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2 bg-background text-text-colour"
                                    name="student.name"
                                    id="student.name"
                                    validate={(name: string) => validateNonEmpty('Name', name)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="student.passcode">
                                    Passcode
                                </label>
                                <Field
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2 bg-background text-text-colour"
                                    name="student.passcode"
                                    id="student.passcode"
                                    validate={(passcode: string) => validateNonEmpty('Passcode', passcode)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="student.email">
                                    Email
                                </label>
                                <Field
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2 bg-background text-text-colour"
                                    name="student.email"
                                    id="student.email"
                                    validate={validateEmail}
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                <Button theme='solid' action={() => { }} disabled={loading || !isValid} type="submit">
                                    Save
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