import { Field, Form, Formik, useField } from "formik";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "../button";
import { LoadingSpinner } from '../loading';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Modal } from '../modal';
import { GetQuizzesQuery } from '@/pages/quiz/list';
import { Class, Student, Group, Quiz } from "@prisma/client";
import { DatetimeField } from '../datetime_field';
import { Tabs } from '../tabs';
import { Selector } from '../selector';
import { ListField } from '../list_field';

const AssignQuizMutation = gql`
    mutation($quizId: String!, $classId: String!, $student: String, $group: String, $start: DateTime!, $end: DateTime!) {
        assignQuiz(quiz: $quizId, classId: $classId, student: $student, group: $group, start: $start, end: $end) {
            id
        }
    }
`;

export const QuizSelector: React.FC = ({ }) => {
    const [field, meta, helper] = useField<Quiz>('quiz');
    const { data, loading, ...all } = useQuery(GetQuizzesQuery);

    const quizzes = (data?.quizzes ?? []) as Quiz[];

    useEffect(() => {
        helper.setValue(quizzes[0]);
    }, [data]);

    if (loading) return;

    return (
        <Selector
            value={meta.value}
            values={quizzes}
            onChange={helper.setValue}
            filter={(quiz: Quiz, search: string) => {
                return quiz.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
            }}
            display={(quiz?: Quiz) => quiz?.name ?? 'loading...'}
            _key={(quiz: Quiz) => quiz.id}
        />
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

    const assignToTabs: AssignTo[] = ['all-students', 'students', 'groups'];

    return (
        <div className="flex flex-col gap-1 py-2">
            <p className="font-bold">Assign to:</p>
            <Tabs
                pages={[
                    {
                        title: 'All Students',
                        content: <p>This quiz will be assigned to all current students.</p>
                    },
                    {
                        title: 'Students',
                        content: _class.students.length > 0 ? <ListField
                            name="students"
                            values={_class.students}
                            _key={(student: Student) => `student-${student.id}`}
                            display={(student?: Student) => student ? `${student.name} (${student.passcode})` : ''}
                            filter={(student: Student, search: string) => {
                                const s = search.toLowerCase();
                                return (student.name.toLowerCase().indexOf(s) >= 0) ||
                                    (student.passcode.toLowerCase().indexOf(s) >= 0);
                            }}
                        /> : <p>This class has no students.</p>
                    },
                    {
                        title: 'Groups',
                        content: _class.groups.length > 0 ? <ListField
                            name="groups"
                            values={_class.groups}
                            _key={(group: Group) => `group-${group.id}`}
                            display={(group?: Group) => group ? `${group.name}` + (group.anonymous ? ` (${group.passcode})` : '') : ''}
                            filter={(group: Group, search: string) => {
                                const s = search.toLowerCase();
                                return (group.name.toLowerCase().indexOf(s) >= 0) ||
                                    (group.passcode.toLowerCase().indexOf(s) >= 0);
                            }}
                        /> : <p>This class has no groups.</p>
                    },
                ]}
                defaultIndex={0}
                onChange={(index) => {
                    helper.setValue(assignToTabs[index]);
                }}
            />
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
                        for (const student of toStudents) {
                            await assignQuiz({
                                variables: {
                                    quizId: quiz.id,
                                    classId: _class.id,
                                    student,
                                    start: new Date(startDate),
                                    end: new Date(endDate),
                                }
                            });
                        }
                        for (const group of toGroups) {
                            await assignQuiz({
                                variables: {
                                    quizId: quiz.id,
                                    classId: _class.id,
                                    group,
                                    start: new Date(startDate),
                                    end: new Date(endDate),
                                }
                            });
                        }
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
                {({ isSubmitting, isValidating, isValid, status }) => {
                    const loading = isSubmitting || isValidating;
                    return (
                        <Form className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="assignments">
                                    Quiz
                                </label>

                                <QuizSelector />
                            </div>

                            <AssignToField _class={_class} />

                            <div className="flex flex-col gap-1">
                                <label htmlFor="startDate">
                                    Start Date
                                </label>
                                <DatetimeField name="startDate" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="endDate">
                                    End Date
                                </label>
                                <DatetimeField name="endDate" />
                            </div>

                            <div className="flex gap-2 items-center py-2">
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