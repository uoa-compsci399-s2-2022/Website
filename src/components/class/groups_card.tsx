import { Class, Student, User } from '@prisma/client';
import Card from '../card';
import ClassCardContainer from './class_card_container';


const GroupsCard: React.FC = ({}) => {
    return (
        <Card>
            <h5 className="mt-4 text-xl font-bold text-text-colour">Groups</h5>
            <ClassCardContainer cols={'grid-cols-2'}>
                <Card width={""}>
                    <h1>Group 1</h1>
                </Card>
                <Card width={""}>
                    <h1>Group 2</h1>
                </Card>
                <Card width={""}>
                    <h1>Group 3</h1>
                </Card>
                

            </ClassCardContainer>
        </Card>
    )
}

export default GroupsCard