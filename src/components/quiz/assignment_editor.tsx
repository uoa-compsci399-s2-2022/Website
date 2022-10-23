import { gql, useMutation } from '@apollo/client';
import { Group, Quiz, QuizAssignment, Student } from '@prisma/client';
import { FieldArray, Form, Formik, useField } from "formik";
import React, { Dispatch, SetStateAction } from "react";
import Button from "../button";
import { DatetimeField } from '../datetime_field';
import { LoadingSpinner } from '../loading';
import { Modal } from '../modal';
import { QuizSelector } from './quiz_assigner';

const UpdateAssignmentMutation = gql`
    mutation($id: String!, $quiz: String, $start: DateTime, $end: DateTime) {
        updateAssignment(id: $id, quiz: $quiz, start: $start, end: $end) {
            id
        }
    }
`;

interface AssigneeSelectorFieldProps {
    unchanged: boolean
}

const AssigneeSelectorField: React.FC<AssigneeSelectorFieldProps> = ({ unchanged }) => {
    const [, assignmentMeta, assignmentHelper] = useField<(QuizAssignment & {
        student?: Student,
        group?: Group,
    })[]>('assignments');

    const [, unchangedMeta, unchangedHelper] = useField<(QuizAssignment & {
        student?: Student,
        group?: Group,
    })[]>('unchanged');

    const myMeta = unchanged ? unchangedMeta : assignmentMeta;

    let error = '';
    // Note: ugly cast, as our errors come as an array of objects
    if (typeof myMeta.error === 'string') {
        error = myMeta.error;
    } else if (myMeta.error) {
        const errors = myMeta.error as any as Record<string, string>[];
        const index = errors.findIndex(e => e);
        if (index >= 0) {
            error = `Instructor ${parseInt(index as any as string) + 1}: ${errors[index]}`;
        }
    }

    return (
        <FieldArray
            name={unchanged ? "unchanged" : "assignments"}
            render={helpers => (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        {
                            myMeta.value && myMeta.value.length > 0 &&
                            myMeta.value.map((assignment, index) => (
                                <div className="flex items-center rounded gap-2 bg-gray-500 px-2" key={`instructor-${index}`}>
                                    {assignment.student?.name ?? assignment.group.name}
                                    <a
                                        onClick={() => {
                                            const otherHelper = unchanged ? assignmentHelper : unchangedHelper;
                                            const otherMeta = unchanged ? assignmentMeta : unchangedMeta;
                                            otherHelper.setValue([
                                                ...otherMeta.value,
                                                assignment,
                                            ])
                                            helpers.remove(index);
                                        }}
                                        className="text-xs cursor-pointer"
                                    >
                                        X
                                    </a>
                                </div>
                            ))
                        }
                        {
                            myMeta.value && myMeta.value.length === 0 && (
                                <p className="text-xs">No assignees selected</p>
                            )
                        }
                    </div>
                    <p className="text-xs">
                        <span className="text-red-500">{error}</span>
                    </p>
                </div>
            )}
        />
    )
}

interface AssignmentEditorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    doRefetch: () => void,
    initialValues?: FormValues,
}

interface FormValues {
    assignments: (QuizAssignment & {
        student?: Student,
        group?: Group,
    })[],
    unchanged: (QuizAssignment & {
        student?: Student,
        group?: Group,
    })[],
    quiz: Quiz,
    startDate: Date,
    endDate: Date,
}

export const AssignmentEditor: React.FC<AssignmentEditorProps> = ({ isOpen, setIsOpen, doRefetch, initialValues }) => {
    const [updateAssignment] = useMutation(UpdateAssignmentMutation);
    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={`Assignment Editor`}
        >
            <Formik
                initialValues={initialValues}
                onSubmit={async ({ assignments, quiz, startDate, endDate }, { setSubmitting, setStatus }) => {
                    try {
                        for (const assignment of assignments) {
                            await updateAssignment({
                                variables: {
                                    id: assignment.id,
                                    quiz: quiz.id,
                                    start: startDate,
                                    end: endDate,
                                }
                            });
                        }
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
                {({ isSubmitting, isValidating, isValid, values, status }) => {
                    const loading = isSubmitting || isValidating;

                    return (
                        <Form className="flex flex-col gap-2">

                            <div className="flex flex-col gap-1">
                                <label htmlFor="assignments">
                                    Assigned Quiz
                                </label>

                                <QuizSelector />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="assignments">
                                    Assignees to change
                                </label>
                                <AssigneeSelectorField unchanged={false} />
                            </div>

                            {
                                values.unchanged.length > 0 && <div className="flex flex-col gap-1">
                                    <label htmlFor="unchanged">
                                        Assignees unchanged
                                    </label>
                                    <AssigneeSelectorField unchanged={true} />
                                </div>
                            }

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