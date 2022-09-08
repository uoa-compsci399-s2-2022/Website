import { Dialog } from "@headlessui/react";
import { Field, FieldArray, Form, Formik, useField } from "formik";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "./button";
import { ImportedStudent } from "./student_import";
import { LoadingSpinner } from './loading';

interface ClassCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
}

interface FormValues {
    name: string,
    textid: string,
    students: ImportedStudent[],
}

export const QuizCreator: React.FC<ClassCreatorProps> = ({ isOpen, setIsOpen }) => {
    const router = useRouter();
    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50 w-full"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full sm:max-w-xl mx-auto rounded bg-white p-4">

                    <Dialog.Title className="text-xl font-bold">Quiz Creator</Dialog.Title>

                    <Formik
                        initialValues={{ name: '', textid: '', students: [{ name: '', passcode: '' }] } as FormValues}
                        onSubmit={({ name, textid, students }, { setSubmitting, setStatus }) => {
                            fetch('/api/quiz', {
                                method: 'POST',
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    name,
                                    textid,
                                    students,
                                })
                            }).then((result) => {
                                result.json().then((res) => {
                                    setSubmitting(false);
                                    if ('error' in res) {
                                        setStatus({ submitError: res['error'] });
                                    } else {
                                        router.reload();
                                    }
                                }).catch(() => {
                                    setSubmitting(false);
                                });
                            }).catch(() => {
                                setSubmitting(false);
                            });
                        }}
                    >
                        {({ isSubmitting, isValidating, isValid, validateForm, status }) => {
                            const loading = isSubmitting || isValidating;
                            return (
                                <Form className="flex flex-col gap-2">

                                    <div className="flex gap-2 items-center">
                                        <Button solid={true} action={() => { }} disabled={loading || !isValid}>
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