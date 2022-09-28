import { Class, Student, User } from '@prisma/client';
import Card from '../card';

interface MainClassProps {
    className: string,
}

const MainClassCard: React.FC<MainClassProps> = ({ className }) => {
    return (
        <Card width="">
            <h5 className="mt-4 text-xl font-bold text-text-colour">{className}</h5>
            <div className='grid grid-cols-3'>
                <button type="button" className="py-2 px-3 text-xs m-2 mt-8 font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">Button</button>
                <button type="button" className="py-2 px-3 text-xs m-2 mt-8 font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">Button</button>
                <button type="button" className="py-2 px-3 text-xs m-2 mt-8 font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">Button</button>
            </div>
        </Card>
    )
}

export default MainClassCard