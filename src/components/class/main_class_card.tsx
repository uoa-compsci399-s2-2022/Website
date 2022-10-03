import { gql, useMutation } from '@apollo/client';
import { Class, Group, Student, User } from '@prisma/client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Button from '../button';
import Card from '../card';
import { Confirmation } from '../confirmation';
import { QuizAssigner } from '../quiz_assigner';
import { ClassEditor } from './class_editor';

interface MainClassProps {
    _class: Class & {
        users: User[],
        students: Student[],
        groups: Group[],
    },
    doRefetch: () => void,
}

const DeleteClassMutation = gql`
    mutation($id: String!) {
        deleteClass(id: $id) {
            id
        }
    }
`;

const MainClassCard: React.FC<MainClassProps> = ({ _class, doRefetch }) => {
    const [editorOpen, setEditorOpen] = useState(false);
    const [assignerOpen, setAssignerOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [deleteClass] = useMutation(DeleteClassMutation);
    const router = useRouter();

    return (
        <>
            <Card width="">
                <h5 className="mt-4 text-xl font-bold text-text-colour">{_class.name}</h5>
                <p>
                    <span className="block">Students</span>
                    <span className="block">Groups</span>
                    <span className="block">Instructors</span>
                    <span className="block">Assigned Quizzes</span>
                </p>
                <div className='grid grid-cols-3 pt-4 gap-4'>
                    <Button action={() => {
                        setAssignerOpen(true);
                    }} theme='solid'>Assign Quiz</Button>
                    <Button action={() => {
                        setEditorOpen(true);
                    }} theme='solid'>Edit Class</Button>
                    <Button action={() => {
                        setDeleteOpen(true);
                    }} theme='danger'>Delete Class</Button>
                </div>
            </Card>

            <ClassEditor
                isOpen={editorOpen}
                setIsOpen={setEditorOpen}
                doRefetch={doRefetch}
                id={_class.id}
                initialValues={
                    {
                        name: _class.name,
                        instructors: _class.users.map(user => user.email),
                    }
                }
            />
            <QuizAssigner
                isOpen={assignerOpen}
                setIsOpen={setAssignerOpen}
                doRefetch={doRefetch}
                _class={_class}
            />

            <Confirmation
                isOpen={deleteOpen}
                setIsOpen={setDeleteOpen}
                title="Delete class"
                message='Are you sure you want to delete this class?  This action cannot be undone!'
                yesTheme="danger"
                yes="Delete"
                onYes={async () => {
                    try {
                        await deleteClass({
                            variables: {
                                id: _class.id,
                            }
                        });
                        await router.replace('/');
                        router.reload();
                    } catch (error) {
                        alert(error);
                    }
                }}
            />
        </>
    )
}

export default MainClassCard