import { Field, Form, Formik, useField } from "formik";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "../button";
import { LoadingSpinner } from '../loading';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Modal } from '../modal';
import { ClassStudentsField } from "../students_field";

const FindOrCreateStudentMutation = gql`
    mutation($name: String!, $passcode: String!, $email: String) {
        findOrCreateStudent(name: $name, passcode: $passcode, email: $email) {
            id
        }
    }
`;

const AddStudentsToClassMutation = gql`
    mutation($id: String!, $students: [String!]) {
        addStudentsToClass(id: $id, students: $students) {
            id
        }
    }
`;

interface StudentCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
    id: string,
}

interface FormValues {
    students: ImportedStudent[],
}

export const StudentCreator: React.FC<StudentCreatorProps> = ({ isOpen, setIsOpen, doRefetch, id }) => {
    const [findOrCreateStudent] = useMutation(FindOrCreateStudentMutation);
    const [addStudentsToClass] = useMutation(AddStudentsToClassMutation);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            title="Add or Import Students"
        >
            <Formik
                initialValues={{ students: [{ name: '', passcode: '' }] } as FormValues}
                onSubmit={async ({ students }, { setSubmitting, setStatus, setFieldError, resetForm }) => {
                    let index = 0;
                    const studentIds: string[] = [];

                    for (const student of students) {
                        try {
                            const data = await findOrCreateStudent({
                                variables: {
                                    name: student.name,
                                    passcode: student.passcode,
                                    email: student.email,
                                }
                            });
                            studentIds.push(data.data.findOrCreateStudent.id);
                        } catch (error) {
                            setFieldError(`students.${index}`, error.toString());
                            setSubmitting(false);
                            return;
                        }
                        index++;
                    }

                    try {
                        await addStudentsToClass({
                            variables: {
                                id,
                                students: studentIds,
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
                            <ClassStudentsField validateForm={validateForm} />

                            <div className="flex gap-2 items-center">
                                <Button theme='solid' action={() => { }} disabled={loading || !isValid} type="submit">
                                    Add
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