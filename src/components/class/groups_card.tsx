import { gql, useMutation } from '@apollo/client';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Class, Group, Student } from '@prisma/client';
import { useState } from 'react';
import Button from '../button';
import Card from '../card';
import { GroupCreator } from './group_creator';

const RemoveGroupFromClassMutation = gql`
    mutation($id: String!, $groupId: String!) {
        removeGroupFromClass(id: $id, groupId: $groupId) {
            id
        }
    }
`;

interface GroupsCardProps {
    _class: Class & {
        students: Student[],
        groups: (Group & {
            students: Student[],
        })[],
    },
    doRefetch: () => void,
}

const GroupsCard: React.FC<GroupsCardProps> = ({ _class, doRefetch }) => {
    const [groupCreatorOpen, setGroupCreatorOpen] = useState(false);
    const [groupEditorState, setGroupEditorState] = useState<Group & {
        students: Student[],
    } | undefined>(undefined);
    const [removeGroupFromClass] = useMutation(RemoveGroupFromClassMutation);

    const doDeleteGroup = async (groupId: string) => {
        try {
            await removeGroupFromClass({
                variables: {
                    id: _class.id,
                    groupId,
                }
            });

            doRefetch();
        } catch (error) {
            alert(error);
        }
    }

    return (
        <Card>
            <h5 className="mt-4 text-xl font-bold text-text-colour">Groups</h5>
            <div className='p-4 overflow-y-auto max-h-96'>

                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    <li className="pb-3 sm:pb-4 flex flex-col gap-2">
                        {
                            _class.groups.map((group) => {
                                return (
                                    <div className="flex items-center space-x-4" key={`group-${group.id}`}>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate dark:text-white">
                                                {group.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                {group.anonymous ? `Passcode ${group.passcode}` : `${group.students.length} students`}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white gap-2">
                                            <Button
                                                theme="passive"
                                                action={() => {
                                                    setGroupEditorState(group);
                                                    setGroupCreatorOpen(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                theme='danger'
                                                action={() => doDeleteGroup(group.id)}
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
            </div>
            <Button action={() => {
                setGroupCreatorOpen(true);
            }} theme='solid'>
                Create group
            </Button>
            <GroupCreator
                isOpen={groupCreatorOpen}
                setIsOpen={setGroupCreatorOpen}
                _class={_class}
                doRefetch={doRefetch}
                editing={groupEditorState}
            />
        </Card>
    )
}

export default GroupsCard