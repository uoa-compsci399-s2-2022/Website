import { validateEmail, validateNonEmpty } from '@/lib/validation';
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, FieldArray, useField } from "formik";
import Button from "../button";
import ImportStudents from "./student_import";


interface ClassStudentFieldProps {
    index: number,
    remove: () => void,
}

const ClassStudentField: React.FC<ClassStudentFieldProps> = ({ index, remove }) => {
    return (
        <tr className="bg-background text-text-colour">
            <td className="border border-1 text-center px-2">{index + 1}</td>
            <td className="border border-1">
                <Field
                    className="w-full p-0.5 bg-background text-text-colour"
                    name={`students.${index}.name`}
                    validate={(name: string) => validateNonEmpty('Name', name)}
                />
            </td>
            <td className="border border-1">
                <Field
                    className="w-full p-0.5 bg-background text-text-colour"
                    name={`students.${index}.passcode`}
                    validate={(passcode: string) => validateNonEmpty('Passcode', passcode)}
                />
            </td>
            <td className="border border-1">
                <Field
                    className="w-full p-0.5 bg-background text-text-colour"
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
                    <FontAwesomeIcon icon={faTrashCan} />
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
                        <Button theme="solid" action={() => helpers.push({ name: '', passcode: '' } as ImportedStudent)}>Add row</Button>
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