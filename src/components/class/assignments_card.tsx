import { gql, useQuery } from '@apollo/client';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Class, Group, Quiz, QuizAssignment, QuizQuestion, Student, User } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import Button from '../button';
import Card from '../card';

export const GetQuizAssignmentsQuery = gql`
    query {
        quizzes {
            id
            created
            name
            description
            timeLimit
            user {
                id
                name
                email
            }
            assignments {
                id
                start
                end
                student {
                    id
                    name
                    passcode
                }
                group {
                    id
                    name
                    anonymous
                    passcode
                }
            }
            questions {
                id
            }
        }
    }
`;

interface AssignmentGroup {
    quiz: Quiz,
    startDate: Date,
    endDate: Date,
    students: Student[],
    groups: Group[],
}

interface AssignmentsCardProps {
    quizzes: (Quiz & {
        user: User,
        assignments: (QuizAssignment & {
            student?: Student,
            group?: Group,
        })[],
        questions: (QuizQuestion | null)[]
    })[];
    loading: boolean,
    doRefetch: () => void,
}

const AssignmentsCard: React.FC<AssignmentsCardProps> = ({ quizzes, loading, doRefetch }) => {
    const searchRef = useRef<HTMLInputElement>(null);
    const [assignmentGroups, setAssignmentGroups] = useState<AssignmentGroup[]>([]);

    useEffect(() => {
        const generateAssignmentKey = (assignment: QuizAssignment): string => {
            return `${assignment.quizId},${assignment.start},${assignment.end}`;
        };
        const groupAssignmentsIntoGroups = (quizzes: (Quiz & {
            assignments: (QuizAssignment & {
                student?: Student,
                group?: Group,
            })[],
        })[]): AssignmentGroup[] => {
            const assignmentRecord: Record<string, AssignmentGroup> = {};
            for (const quiz of quizzes) {
                for (const assignment of quiz.assignments) {
                    const key = generateAssignmentKey(assignment);

                    if (key in assignmentRecord) {
                        if (assignment.student) {
                            assignmentRecord[key].students.push(assignment.student);
                        } else if (assignment.group) {
                            assignmentRecord[key].groups.push(assignment.group);
                        }
                    } else {
                        const members: any = {
                            students: [],
                            groups: [],
                        };
                        if (assignment.student) {
                            members.students = [assignment.student];
                        } else if (assignment.group) {
                            members.groups = [assignment.group];
                        }

                        assignmentRecord[key] = {
                            quiz,
                            startDate: new Date(assignment.start),
                            endDate: new Date(assignment.end),
                            ...members,
                        }
                    }
                }
            }
            return Object.values(assignmentRecord);
        };

        const groups = groupAssignmentsIntoGroups(quizzes);
        setAssignmentGroups(groups);

    }, [quizzes]);

    const getDateText = (date: Date): string => {
        return `${date.toLocaleDateString('en-NZ')} at ${date.getHours()}:${date.getMinutes()}`
    }

    const studentSummary = (assignmentGroup: AssignmentGroup): string => {
        const names = [
            ...assignmentGroup.students.map(student => student.name),
            ...assignmentGroup.groups.map(group => group.name)
        ];
        if (names.length > 3) {
            const first = names.slice(0, 3);
            return `${first.join(', ')} and ${names.length - 3} others.`;
        } else if (names.length > 0) {
            return names.join(', ') + '.';
        }

        return '0 students, 0 groups';
    };

    return (
        <Card>
            <h5 className="my-4 text-xl font-bold text-text-colour">Assignments</h5>
            <div className='flex flex-col gap-2 p-4 overflow-y-auto max-h-96'>
                {loading ? <p>loading...</p> :
                    assignmentGroups.map(assignmentGroup => (
                        <div
                            className="flex"
                            key={`assignmentGroup-${assignmentGroup.quiz.id}-${assignmentGroup.startDate}-${assignmentGroup.endDate}`}
                        >
                            <div className="flex-grow">
                                <span className="text-white block">{assignmentGroup.quiz.name}</span>
                                <span className="block">
                                    Opens: {getDateText(assignmentGroup.startDate)}.  Closes: {getDateText(assignmentGroup.endDate)}
                                </span>
                                <span className="block">
                                    Assigned to {studentSummary(assignmentGroup)}
                                </span>
                            </div>
                            <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white gap-2">
                                <Button
                                    theme="passive"
                                    action={() => {
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    theme='danger'
                                    action={() => { }}
                                >
                                    <FontAwesomeIcon className="py-1" icon={faTrashCan} />
                                </Button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </Card>
    )
}

export default AssignmentsCard