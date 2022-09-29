import { Field, FieldArray, Form, Formik, useField } from "formik";
import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import Button from "./button";
import { LoadingSpinner } from './loading';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Modal } from './modal';
import { GetQuizzesQuery } from '@/pages/quiz/list';
import { Combobox, Tab, Transition } from "@headlessui/react";
import { Class, Student, Group, User, Quiz } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const AssignQuizMutation = gql`
    mutation($quizId: String!, $students: [String!], $groups: [String!], $start: DateTime!, $end: DateTime!) {
        assignQuiz(quiz: $quizId, students: $students, groups: $groups, start: $start, end: $end) {
            id
        }
    }
`;

interface StudentSelectorProps {
    students: Student[],
}

const StudentSelector: React.FC<StudentSelectorProps> = ({ students }) => {
    const [field, meta, helper] = useField<Student[]>('students');
    const [selected, setSelected] = useState(students[0]);
    const [query, setQuery] = useState('');

    const filteredStudents =
        query.length === 0 ? students :
            students.filter((student) => {
                return student.name.toLowerCase().includes(query.toLowerCase());
            });

    return (
        <FieldArray
            name="students"
            render={helpers => (
                <div className="flex flex-col gap-2">
                    {
                        meta.value && meta.value.length > 0 &&
                        meta.value.map((student: Student, index: number) => (
                            <div className="flex flex-col gap-1" key={`student-${student.id}`}>
                                <div className="flex gap-2">
                                    <p
                                        className="outline outline-1 focus:outline-2 rounded w-full p-2"
                                    >
                                        {student.name} ({student.passcode})
                                    </p>
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
                    <div className="flex gap-2">
                        <Combobox value={selected} onChange={setSelected}>
                            <div className="relative mt-1 w-full">
                                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                                    <Combobox.Input
                                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                        displayValue={(student: Student) => `${student.name} (${student.passcode})`}
                                        onChange={(event) => setQuery(event.target.value)}
                                    />
                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                        {/* @ts-ignore */}
                                        <FontAwesomeIcon icon={faChevronDown} className="text-black" />
                                    </Combobox.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                    afterLeave={() => setQuery('')}
                                >
                                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        {filteredStudents.length === 0 && query !== '' ? (
                                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                Nothing found.
                                            </div>
                                        ) : (
                                            filteredStudents.map((student) => (
                                                <Combobox.Option
                                                    key={student.id}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={student}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                    }`}
                                                            >
                                                                {student.name}
                                                            </span>
                                                            {selected ? (
                                                                <span
                                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'
                                                                        }`}
                                                                >
                                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Combobox.Option>
                                            ))
                                        )}
                                    </Combobox.Options>
                                </Transition>
                            </div>
                        </Combobox>
                        <Button
                            action={() => {
                                helpers.push(selected);
                            }}
                            preventDefault={true}
                        >
                            Add
                        </Button>
                    </div>
                    <p className="text-xs mb-2 flex">
                        <span className="flex-grow">Count: {meta.value.length}</span>
                    </p>
                </div>
            )}
        />
    )
};

interface GroupSelectorProps {
    groups: Group[],
}

const GroupSelector: React.FC<GroupSelectorProps> = ({ groups }) => {
    return (
        <div>
            <p>TODO: implement this.</p>
        </div>
    );
};

const QuizSelector: React.FC = ({ }) => {
    const [field, meta, helper] = useField<Student[]>('quiz');
    const { data, loading, ...all } = useQuery(GetQuizzesQuery);

    const quizzes = (data?.quizzes ?? []) as Quiz[];
    const [selected, setSelected] = useState(quizzes[0]);
    const [query, setQuery] = useState('');

    if (loading) return;

    const filteredStudents =
        query.length === 0 ? quizzes :
            quizzes.filter((quiz) => {
                return quiz.name.toLowerCase().includes(query.toLowerCase());
            });

    return (
        <Combobox value={meta.value} onChange={helper.setValue}>
            <div className="relative mt-1 w-full">
                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        displayValue={(quiz?: Quiz) => `${quiz?.name}`}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {/* @ts-ignore */}
                        <FontAwesomeIcon icon={faChevronDown} className="text-black" />
                    </Combobox.Button>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredStudents.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Nothing found.
                            </div>
                        ) : (
                            filteredStudents.map((student) => (
                                <Combobox.Option
                                    key={student.id}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                        }`
                                    }
                                    value={student}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                    }`}
                                            >
                                                {student.name}
                                            </span>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'
                                                        }`}
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    )
};

type AssignTo = 'all-students' | 'students' | 'groups';

interface AssignToFieldProps {
    _class: Class & {
        students: Student[],
        groups: Group[],
    },
}

const AssignToField: React.FC<AssignToFieldProps> = ({ _class }) => {
    const [input, meta, helper] = useField<AssignTo>('assignTo');

    const tabStyle = ({ selected }: { selected: boolean }): string => {
        return 'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700' +
            '  focus:outline-none ' +
            (selected
                ? 'bg-white shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white');
    };

    const assignToTabs: AssignTo[] = ['all-students', 'students', 'groups'];

    return (
        <div className="flex flex-col gap-1">
            <p className="font-bold">Assign to:</p>
            <Tab.Group
                defaultIndex={0}
                onChange={(index) => {
                    helper.setValue(assignToTabs[index]);
                }}
            >
                <div className="w-full mx-auto flex flex-col gap-2">
                    <Tab.List className="w-full flex mx-auto space-x-1 rounded-xl bg-blue-900/20 p-1">
                        <Tab className={tabStyle}>All Students</Tab>
                        <Tab className={tabStyle}>Student</Tab>
                        <Tab className={tabStyle}>Group</Tab>
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel />
                        <Tab.Panel>
                            <StudentSelector students={_class.students} />
                        </Tab.Panel>
                        <Tab.Panel>
                            <GroupSelector groups={_class.groups} />
                        </Tab.Panel>
                    </Tab.Panels>

                </div>
            </Tab.Group>
        </div>
    )
}

interface QuizAssignerProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
    _class: Class & {
        students: Student[],
        groups: Group[],
    },
}


interface FormValues {
    assignTo: AssignTo,
    students: Student[],
    groups: Group[],
    quiz: Quiz,
    startDate: Date,
    endDate: Date,
}

export const QuizAssigner: React.FC<QuizAssignerProps> = ({ isOpen, setIsOpen, doRefetch, _class }) => {
    const [assignQuiz] = useMutation(AssignQuizMutation);
    const { data, loading } = useQuery(GetQuizzesQuery);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            title="Quiz Assigner"
        >
            <Formik
                initialValues={{ assignTo: 'all-students', students: [], groups: [], startDate: new Date(), endDate: new Date() } as FormValues}
                onSubmit={async ({ assignTo, students, groups, quiz, startDate, endDate }, { setSubmitting, setStatus, resetForm }) => {

                    let toStudents: string[] = [];
                    let toGroups: string[] = [];

                    switch (assignTo) {
                        case 'all-students': {
                            toStudents = _class.students.map(student => student.id);
                            break;
                        }
                        case 'students': {
                            toStudents = students.map(student => student.id);
                            break;
                        }
                        case 'groups': {
                            toGroups = groups.map(group => group.id);
                            break;
                        }
                    }

                    try {
                        await assignQuiz({
                            variables: {
                                quizId: quiz.id,
                                students: toStudents,
                                groups: toGroups,
                                start: startDate,
                                end: endDate,
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
                            <AssignToField _class={_class} />

                            <div className="flex flex-col gap-1">
                                <label htmlFor="startDate">
                                    Start Date
                                </label>
                                <Field
                                    id="startDate"
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2 bg-slate-800"
                                    name="startDate"
                                    type="datetime-local"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="endDate">
                                    End Date
                                </label>
                                <Field
                                    id="endDate"
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2 bg-slate-800"
                                    name="endDate"
                                    type="datetime-local"
                                />
                            </div>

                            <QuizSelector />

                            <div className="flex gap-2 items-center">
                                <Button theme='solid' action={() => { }} disabled={loading || !isValid} type="submit">
                                    Assign
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