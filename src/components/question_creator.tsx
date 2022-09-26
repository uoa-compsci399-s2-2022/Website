import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { Field, Form, Formik, useField } from "formik";
import { useRouter } from "next/router";
import React, { Dispatch, Fragment, ReactElement, SetStateAction } from "react";
import Button from "./button";
import { LoadingSpinner } from './loading';
import { Modal } from './modal';
import { DescriptionQuestionBuilder } from './question/description';
import { MultiChoiceQuestionBuilder } from './question/multichoice';

const TypeNames: Record<QuestionType, string> = {
    'description': 'Description',
    'multichoice': 'Multi-choice',
    'numerical': 'Numerical'
}

const TypeBuilders: Record<QuestionType, ReactElement> = {
    'description': <DescriptionQuestionBuilder />,
    'multichoice': <MultiChoiceQuestionBuilder />,
    'numerical': <DescriptionQuestionBuilder />
}

interface CategorySelectorProps {

}

const CategorySelector: React.FC<CategorySelectorProps> = ({ }) => {
    const [field, meta, helper] = useField('category');

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor="category">
                Category
            </label>
            <Field
                id="category"
                className="outline outline-1 focus:outline-2 rounded w-full p-2"
                name="category"
                type="text"
            />
            <p>
                To create folders, seperate category names with a fullstop.
            </p>
        </div>
    );
}

const TypeSelector: React.FC = () => {
    const [field, meta, helper] = useField('type');
    const [_1, _2, contentHelper] = useField('content');

    const onChange = (value: QuestionType) => {
        helper.setValue(value);
        contentHelper.setValue({});
    }

    return (
        <div className="flex flex-col gap-1">
            <label>
                Type
            </label>
            <Listbox value={meta.value} onChange={onChange}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer bg-white p-2 text-left outline outline-1 focus:outline-2 rounded">
                        <span className="block truncate">{TypeNames[meta.value as QuestionType]}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            {/* @ts-ignore */}
                            <FontAwesomeIcon icon={faChevronDown} />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {Object.keys(TypeNames).map((value, index) => (
                                <Listbox.Option
                                    key={index}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                        }`
                                    }
                                    value={value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                    }`}
                                            >
                                                {TypeNames[value as QuestionType]}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                    <FontAwesomeIcon className="h-5 w-5" aria-hidden="true" icon={faCheckCircle} />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}

interface QuestionCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
}

interface FormValues {
    name: string,
    type: QuestionType,
    category: string,
    content: any,
    attribution: string,
}

export const QuestionCreator: React.FC<QuestionCreatorProps> = ({ isOpen, setIsOpen }) => {
    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            title="Question Creator"
        >
            <Formik
                initialValues={{ name: '', type: 'description', category: '', content: {}, attribution: '' } as FormValues}
                onSubmit={({ name, type, category, content, attribution }, { setSubmitting, setStatus }) => {

                }}
            >
                {({ isSubmitting, isValidating, isValid, validateForm, status, values }) => {
                    console.log(values);
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
                            <CategorySelector />
                            <TypeSelector />

                            {
                                TypeBuilders[values.type]
                            }

                            <div className="flex flex-col gap-1">
                                <label htmlFor="attribution">
                                    Copyright Attribution
                                </label>
                                <Field
                                    id="attribution"
                                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                                    name="attribution"
                                    type="text"
                                />
                            </div>

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
        </Modal>
    )
};