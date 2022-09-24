import { Dialog } from "@headlessui/react";
import { Field, FieldArray, Form, Formik, useField } from "formik";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "./button";
import ImportStudents from "./student_import";
import { LoadingSpinner } from './loading';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Student } from '@prisma/client';

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
                className="outline outline-1 focus:outline-2 rounded w-full p-2"
                name="name"
                type="text"
            />
            <p className="text-xs flex">
                Generated ID: <Field
                    name="textid"
                    type="text"
                    className="flex-grow pl-2"
                    validate={validateTextId}
                    disabled
                />
                {touched && <span className="text-red-500">{meta.error}</span>}
            </p>
        </div >
    )
};

interface ClassStudentFieldProps {
    index: number,
    remove: () => void,
}

const ClassStudentField: React.FC<ClassStudentFieldProps> = ({ index, remove }) => {
    const validateNonEmpty = (field: string, value: string): string | undefined => {
        let error;

        if (!value) {
            error = field + ' required';
        } else if (value.length <= 0) {
            error = field + ' cannot be empty';
        }

        return error;
    }

    const validateEmail = (email: string): string | undefined => {
        let error;

        // Regex from https://formik.org/docs/guides/validation#form-level-validation
        // note that emails are not required
        if (email && email.length > 0 && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
            error = 'Invalid email address';
        }

        return error;
    }

    return (
        <tr>
            <td className="border border-1 text-center px-2">{index + 1}</td>
            <td className="border border-1">
                <Field
                    className="w-full p-0.5"
                    name={`students.${index}.name`}
                    validate={(name: string) => validateNonEmpty('Name', name)}
                />
            </td>
            <td className="border border-1">
                <Field
                    className="w-full p-0.5"
                    name={`students.${index}.passcode`}
                    validate={(passcode: string) => validateNonEmpty('Passcode', passcode)}
                />
            </td>
            <td className="border border-1">
                <Field
                    className="w-full p-0.5"
                    name={`students.${index}.email`}
                    validate={validateEmail}
                />
            </td>
            <td className="border border-1">
                <span
                    title="Remove"
                    onClick={() => remove()}
                    className="flex items-center justify-center text-center cursor-pointer px-2"
                >
                    -
                </span>
            </td>
        </tr>
    );
}

interface ClassStudentsFieldProp {
    validateForm: () => void;
}

export const ClassStudentsField: React.FC<ClassStudentsFieldProp> = ({ validateForm }) => {
    const [field, meta, helper] = useField<ImportedStudent[]>('students');

    let error = '';
    // Note: ugly cast, as our errors come as an array of objects
    if (typeof meta.error === 'string') {
        error = meta.error;
    } else if (meta.error) {
        const errors = meta.error as any as Record<string, string>[];
        const index = errors.findIndex(e => e);
        if (index >= 0) {
            if (typeof errors[index] === 'string') {
                error = `Student ${parseInt(index as any as string) + 1}: ${errors[index]}`
            } else {
                let key = Object.keys(errors[index])[0];
                error = `Student ${parseInt(index as any as string) + 1}: ${errors[index][key]}`
            }
        }
        console.log(meta.error);
    }

    const importStudents = (students: ImportedStudent[]) => {
        helper.setValue([...meta.value, ...students]);
    };

    return (
        <div className="flex flex-col gap-1 my-2">
            <div className="flex place-content-between items-center">
                <label htmlFor="students">Students</label>
                <ImportStudents onImport={importStudents} />
            </div>
            <FieldArray
                name="students"
                render={helpers => (
                    <div className="flex flex-col gap-2">
                        <table className="table-auto overflow-y-scroll max-h-80 w-full block">
                            <thead>
                                <tr>
                                    <th className="border border-1 px-2">#</th>
                                    <th className="border border-1 min-w-full">Name</th>
                                    <th className="border border-1 min-w-full">Passcode</th>
                                    <th className="border border-1 min-w-full">Email (optional)</th>
                                    <th className="border border-1 px-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {meta.value && meta.value.length > 0 &&
                                    meta.value.map((_, index) => (
                                        <ClassStudentField
                                            key={index}
                                            index={index}
                                            remove={() => {
                                                helpers.remove(index);
                                                setTimeout(() => {
                                                    validateForm();
                                                }, 150);
                                            }}
                                        />
                                    ))
                                }
                            </tbody>
                        </table>
                        <Button action={() => helpers.push({ name: '', passcode: '' } as ImportedStudent)}>Add row</Button>
                    </div>
                )}
            />
            <p className="text-xs mb-2 flex">
                <span className="flex-grow">Count: {meta.value.length}</span>
                <span className="text-red-500">{error}</span>
            </p>
        </div>
    )
}

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
    const router = useRouter();
    const [createClass] = useMutation(CreateClassMutation);
    const [findOrCreateStudent] = useMutation(FindOrCreateStudentMutation);

    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50 w-full"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full sm:max-w-xl mx-auto rounded bg-white p-4">

                    <Dialog.Title className="text-xl font-bold">Class Creator</Dialog.Title>

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
                                        <Button solid={true} action={() => { }} disabled={loading || !isValid} type="submit">
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
                </Dialog.Panel>
            </div>
        </Dialog>
    )
};