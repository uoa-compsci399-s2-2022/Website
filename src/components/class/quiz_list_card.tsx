import { Class, Student, User } from '@prisma/client';
import Card from '../card';


const QuizListCard: React.FC = ({}) => {
    return (
        <Card>
            <h5 className="mt-4 text-xl font-bold text-text-colour">Test</h5>
            <div className='grid grid-cols-3'>
                <button type="button" className="py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">Extra small</button>
                <button type="button" className="py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">Extra small</button>
                <button type="button" className="py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">Extra small</button>
            </div>
        </Card>
    )
}

export default QuizListCard