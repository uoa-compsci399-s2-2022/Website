import { gql, useMutation } from '@apollo/client';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Student } from '@prisma/client';
import { useState } from 'react';
import Button from '../button';
import Card from '../card';
import { StudentCreator } from '../students/student_creator';
import { StudentEditor } from '../students/student_editor';

interface StudentProps {
    students: Student[],
    id: string,
    doRefetch: () => void,
}

const RemoveStudentsFromClassMutation = gql`
    mutation($id: String!, $students: [String!]) {
        removeStudentsFromClass(id: $id, students: $students) {
            id
        }
    }
`;

const StudentsCard: React.FC<StudentProps> = ({ students, id, doRefetch }) => {
    const [studentCreatorOpen, setStudentCreatorOpen] = useState(false);
    const [studentEditorState, setStudentEditorState] = useState<Student | undefined>(undefined);
    const [removeStudentsFromClass] = useMutation(RemoveStudentsFromClassMutation);

    const doDeleteStudent = async (studentId: string) => {
        try {
            await removeStudentsFromClass({
                variables: {
                    id,
                    students: [studentId],
                }
            });

            doRefetch();
        } catch (error) {
            alert(error);
        }
    }

    return (
        <>
            <Card>
                <h5 className="mt-4 text-xl font-bold text-text-colour">Manage Students</h5>
                <div className='p-4 overflow-y-auto max-h-96'>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li className="pb-3 sm:pb-4 flex flex-col gap-2">
                            {
                                students.map((student) => {
                                    return (
                                        <div className="flex items-center space-x-4" key={`student-${student.id}`}>
                                            <div className="flex-shrink-0">
                                                <img className="w-8 h-8 rounded-full" src="/user.png"></img>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate dark:text-white">
                                                    {student.name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                    {student.passcode}
                                                    {student.email ? ` Email ${student.email}` : ''}
                                                </p>
                                            </div>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white gap-2">
                                                <Button
                                                    theme="passive"
                                                    action={() => {
                                                        setStudentEditorState(student);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    theme='danger'
                                                    action={() => doDeleteStudent(student.id)}
                                                >
                                                    <FontAwesomeIcon className="py-1" icon={faTrashCan} />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                        </li>
                    </ul>
                    <Button action={() => {
                        setStudentCreatorOpen(true);
                    }} theme='solid'>Add or import student(s)</Button>
                </div>
            </Card>
            <StudentCreator
                isOpen={studentCreatorOpen}
                setIsOpen={setStudentCreatorOpen}
                doRefetch={doRefetch}
                id={id}
            />
            <StudentEditor
                isOpen={studentEditorState !== undefined}
                setIsOpen={(value) => {
                    if (value === false) {
                        setStudentEditorState(undefined);
                    } else {
                        alert('Error!');
                    }
                }}
                doRefetch={doRefetch}
                initialProps={{ student: studentEditorState }}
                id={studentEditorState?.id}
            />
        </>
    )
}

export default StudentsCard