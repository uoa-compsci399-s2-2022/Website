import { Dialog } from "@headlessui/react";
import { Field, Form, Formik, useField } from "formik";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Button from "./button";
import ImportStudents, { ImportedStudent } from "./import";

export const ClassNameField: React.FC = ({ }) => {
    const [_, { value }] = useField('name');
    const [field, meta, helper] = useField('textid');

    useEffect(() => {
        const textid = value.toLowerCase().replace(/ /gi, '-').replace(/[^a-z0-9\-]/gi, '');
        fetch('/api/class?' + new URLSearchParams({
            textid
        }), {
            method: 'GET',
        }).then((res) => {
            res.json().then((result) => {
                if ('error' in result) {
                    helper.setValue(textid);
                } else {
                }
            }).catch((e) => {
                console.log(e);
            });
        }).catch(err => {
            //console.log(err);
        });
    }, [value]);

    return (
        <div>
            <label>
                Class name
            </label>
            <Field
                className="outline outline-1 focus:outline-2 rounded w-full p-2"
                name="name"
                type="text"
            />

            <p className="text-xs">Generated ID: {meta.value}</p>
        </div>
    )
};

interface ClassCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
}

export const ClassCreator: React.FC<ClassCreatorProps> = ({ isOpen, setIsOpen }) => {
    const router = useRouter();

    const importedStudents = (students: ImportedStudent[]) => {
        console.log(students);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50 w-full"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full sm:max-w-xl mx-auto rounded bg-white p-4">

                    <Dialog.Title className="text-xl font-bold">Create class</Dialog.Title>

                    <Formik
                        initialValues={{ name: '', textid: '', students: [] }}
                        onSubmit={({ name, textid, students }, { setSubmitting }) => {
                            fetch('/api/class', {
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
                                result.json().then(() => {
                                    setSubmitting(false);
                                    router.reload();
                                }).catch(() => {
                                    setSubmitting(false);
                                });
                            }).catch(() => {
                                setSubmitting(false);
                            });
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="flex flex-col gap-2">
                                <ClassNameField />
                                <div
                                    className="flex place-content-between items-center"
                                >
                                    <label>
                                        Students
                                    </label>
                                    <ImportStudents onImport={importedStudents} />
                                </div>
                                <textarea
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                                    name="className" />
                                {/*value={classCreated.students.join('\n')}
                            onChange={(e) => classStudentsChanged(e.target.value)} />*/}
                                <p className="text-xs mb-2">Count: {/*classCreated.students.length*/}</p>


                                <div className="flex gap-2">
                                    <Button solid={true} action={() => { }} disabled={isSubmitting}>Create</Button>
                                    <Button action={() => setIsOpen(false)} preventDefault={true}>Cancel</Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
};