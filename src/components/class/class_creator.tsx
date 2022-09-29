import { Field, Form, Formik, useField } from "formik";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "../button";
import { LoadingSpinner } from '../loading';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Modal } from '../modal';
import { ClassStudentsField } from "../students_field";

const CreateClassMutation = gql`
    mutation($textid: String!, $name: String!, $students: [String!]) {
        createClass(textid: $textid, name: $name, students: $students) {
            id
            name
        }
    }
`;

const FindOrCreateStudentMutation = gql`
    mutation($name: String!, $passcode: String!, $email: String) {
        findOrCreateStudent(name: $name, passcode: $passcode, email: $email) {
            id
        }
    }
`;

const GetClassQuery = gql`
    query($textid: String!) {
        class(textid: $textid) {
            id
        }
    }
`

const ClassNameField: React.FC = () => {
    const [_, { value, touched }] = useField('name');
    const [field, meta, helper] = useField('textid');
    const [getClass, { loading, error, data }] = useLazyQuery(GetClassQuery);

    useEffect(() => {
        const textid = value.toLowerCase().replace(/ /gi, '-').replace(/[^a-z0-9\-]/gi, '');
        helper.setValue(textid);
    }, [value]);

    const validateTextId = async (textid: string): Promise<string | undefined> => {
        let error;
        if (!textid) {
            error = 'Name cannot be empty'
        } else {
            const _class = await getClass({
                variables: { textid }
            });
            if (_class.data.class) {
                error = 'Text ID taken';
            }
        }

        return error;
    }

    return (
        <div className="flex flex-col gap-1 my-2">
            <label htmlFor="name">
                Class name
            </label>
            <Field
                id="name"
                className="outline outline-1 focus:outline-2 rounded w-full p-2 bg-background text-text-colour"
                name="name"
                type="text"
            />
            <p className="text-xs flex">
                Generated ID: <Field
                    name="textid"
                    type="text"
                    className="flex-grow pl-2 bg-primary"
                    validate={validateTextId}
                    disabled
                />
                {touched && <span className="text-red-500">{meta.error}</span>}
            </p>
        </div >
    )
};

interface ClassCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
}

interface FormValues {
    name: string,
    textid: string,
    students: ImportedStudent[],
}

export const ClassCreator: React.FC<ClassCreatorProps> = ({ isOpen, setIsOpen, doRefetch }) => {
    const [createClass] = useMutation(CreateClassMutation);
    const [findOrCreateStudent] = useMutation(FindOrCreateStudentMutation);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            title="Class Creator"
        >
            <Formik
                initialValues={{ name: '', textid: '', students: [{ name: '', passcode: '' }] } as FormValues}
                onSubmit={async ({ name, textid, students }, { setSubmitting, setStatus, setFieldError, resetForm }) => {
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
                        await createClass({
                            variables: {
                                textid,
                                name,
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
                            <ClassNameField />
                            <ClassStudentsField validateForm={validateForm} />

                            <div className="flex gap-2 items-center">
                                <Button theme='solid' action={() => { }} disabled={loading || !isValid} type="submit">
                                    Create
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