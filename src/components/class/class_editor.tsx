import { validateEmail } from '@/lib/validation';
import { gql, useMutation } from '@apollo/client';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Field, FieldArray, Form, Formik, useField } from "formik";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction } from "react";
import Button from "../button";
import { LoadingSpinner } from '../loading';
import { Modal } from '../modal';

const UpdateClassMutation = gql`
    mutation($id: String!, $name: String, $instructors: [String!]) {
        updateClass(id: $id, name: $name, users: $instructors) {
            id
        }
    }
`;

const InstructorsField: React.FC = () => {
    const [field, meta, helper] = useField<string[]>('instructors');

    let error = '';
    // Note: ugly cast, as our errors come as an array of objects
    if (typeof meta.error === 'string') {
        error = meta.error;
    } else if (meta.error) {
        const errors = meta.error as any as Record<string, string>[];
        const index = errors.findIndex(e => e);
        if (index >= 0) {
            error = `Instructor ${parseInt(index as any as string) + 1}: ${errors[index]}`;
        }
        console.log(meta.error);
    }

    return (
        <FieldArray
            name="instructors"
            render={helpers => (
                <div className="flex flex-col gap-2">
                    {
                        meta.value && meta.value.length > 0 &&
                        meta.value.map((_, index) => (
                            <div className="flex flex-col gap-1" key={`instructor-${index}`}>
                                <label htmlFor={`instructors.${index}`}>
                                    Instructor {index + 1}
                                </label>
                                <div className="flex gap-2 ">
                                    <Field
                                        id={`instructors.${index}`}
                                        className="outline outline-1 focus:outline-2 rounded w-full p-2 text-text-colour"
                                        name={`instructors.${index}`}
                                        type="text"
                                        validate={validateEmail}
                                    />
                                    <Button
                                        action={() => { helpers.remove(index) }}
                                        preventDefault={true}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    }
                    <Button
                        action={() => helpers.push('')}
                        preventDefault={true}
                    >
                        Add instructor
                    </Button>
                    <p className="text-xs mb-2 flex">
                        <span className="flex-grow">Count: {meta.value.length}</span>
                        <span className="text-red-500">{error}</span>
                    </p>
                </div>
            )}
        />
    )
}

interface ClassEditorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
    initialValues: FormValues,
    id: string,
}

interface FormValues {
    name: string,
    instructors: string[]
}

export const ClassEditor: React.FC<ClassEditorProps> = ({ isOpen, setIsOpen, doRefetch, initialValues, id }) => {
    const router = useRouter();
    const [updateClass] = useMutation(UpdateClassMutation);
    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={`Class Editor`}
        >
            <Formik
                initialValues={initialValues}
                onSubmit={async ({ name, instructors }, { setSubmitting, setStatus }) => {
                    try {
                        await updateClass({
                            variables: {
                                id,
                                name,
                                instructors
                            }
                        });
                        doRefetch();
                        setIsOpen(false);
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
                            <InstructorsField />
                            <div className="flex gap-2 items-center">
                                <Button theme='solid' action={() => { }} disabled={loading || !isValid}>
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