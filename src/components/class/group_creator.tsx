import { Field, Form, Formik, useField } from "formik";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "../button";
import { LoadingSpinner } from '../loading';
import { gql, useMutation } from '@apollo/client';
import { Modal } from '../modal';
import { validateEmail, validateNonEmpty } from '@/lib/validation';
import { Class, Group, Student } from '@prisma/client';
import { Tabs } from '../tabs';
import { ListField } from '../list_field';

const AddGroupToClassMutation = gql`
    mutation($id: String!, $group: GroupInput) {
        addGroupToClass(id: $id, group: $group) {
            id
        }
    }
`;

const UpdateGroupMutation = gql`
    mutation($id: String!, $name: String, $anonymous: Boolean, $passcode: String, $students: [String!]) {
        updateGroup(id: $id, name: $name, anonymous: $anonymous, passcode: $passcode, students: $students) {
            id
        }
    }
`;

interface GroupTypeFieldProps {
    students: Student[],
    setFieldValue: (field: string, value: any) => void,
}

const GroupTypeField: React.FC<GroupTypeFieldProps> = ({ students, setFieldValue }) => {
    const [input, meta, helper] = useField<boolean>('anonymous');

    return (
        <div className="flex flex-col gap-1 py-2">
            <p className="font-bold">Group Type</p>
            <Tabs
                pages={[
                    {
                        title: 'Anonymous',
                        content: <div>
                            <p>This group is anonymous.  All students will use one passcode to login.</p>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="passcode">
                                    Passcode
                                </label>
                                <Field
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                                    name="passcode"
                                    id="passcode"
                                    validate={(passcode: string) => validateNonEmpty('Passcode', passcode)}
                                />
                            </div>
                        </div>
                    },
                    {
                        title: 'Students',
                        content: students.length > 0 ? <ListField
                            name="students"
                            values={students}
                            _key={(student: Student) => `student-${student.id}`}
                            display={(student?: Student) => student ? `${student.name} (${student.passcode})` : ''}
                            filter={(student: Student, search: string) => {
                                const s = search.toLowerCase();
                                return (student.name.toLowerCase().indexOf(s) >= 0) ||
                                    (student.passcode.toLowerCase().indexOf(s) >= 0);
                            }}
                        /> : <p>This class has no students.</p>
                    }
                ]}
                defaultIndex={meta.value ? 0 : 1}
                onChange={(index) => {
                    helper.setValue(index === 0);
                    setFieldValue('students', []);
                    setFieldValue('passcode', '');
                }}
            />
        </div>
    )
}

interface GroupCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
    _class: Class & {
        students: Student[],
        groups: Group[],
    },
    editing?: Group & {
        students: Student[],
    },
}

interface FormValues {
    name: string,
    anonymous: boolean,
    passcode: string,
    students: Student[],
}

export const GroupCreator: React.FC<GroupCreatorProps> = ({ isOpen, setIsOpen, doRefetch, _class, editing }) => {
    const [addGroupToClass] = useMutation(AddGroupToClassMutation);
    const [updateGroup] = useMutation(UpdateGroupMutation);

    const initialValues = editing ? {
        name: editing.name,
        anonymous: editing.anonymous,
        passcode: editing.passcode,
        students: editing.students,
    } : {
        name: '',
        anonymous: true,
        passcode: '',
        students: []
    }

    console.log(initialValues);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            title={`${editing !== undefined ? 'Update' : 'Create'} Group`}
        >
            <Formik
                initialValues={initialValues}
                onSubmit={async ({ name, anonymous, passcode, students }, { setSubmitting, setStatus, setFieldError, resetForm }) => {
                    try {
                        if (editing) {
                            await updateGroup({
                                variables: {
                                    id: editing.id,
                                    name,
                                    anonymous,
                                    passcode,
                                    students: students.map(student => student.id)
                                }
                            });
                        } else {
                            await addGroupToClass({
                                variables: {
                                    id: _class.id,
                                    group: {
                                        name,
                                        anonymous,
                                        passcode,
                                        students: students.map(student => student.id)
                                    }
                                }
                            })
                        }
                        setSubmitting(false);
                        resetForm();
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
                {({ isSubmitting, isValidating, isValid, validateForm, status, setFieldValue }) => {
                    const loading = isSubmitting || isValidating;
                    return (
                        <Form className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="name">
                                    Name
                                </label>
                                <Field
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                                    name="name"
                                    id="name"
                                    validate={(name: string) => validateNonEmpty('Name', name)}
                                />
                            </div>
                            <GroupTypeField
                                students={_class.students}
                                setFieldValue={setFieldValue}
                            />
                            <div className="flex gap-2 items-center">
                                <Button theme='solid' action={() => { }} disabled={loading || !isValid} type="submit">
                                    {editing !== undefined ? 'Save' : 'Create'}
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