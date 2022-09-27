import { Class, Student, User } from '@prisma/client';
import Card from '../card';

interface StudentProps {
}


const StudentsCard: React.FC<StudentProps> = ({}) => {
    const students = {
        
    }

    return (
        <Card height={"flex flex-col"}>
            <h5 className="mt-4 text-xl font-bold text-text-colour">Students</h5>
            <div className='p-4 overflow-y-auto max-h-96'>
                <ul className="max-w-md divide-y divide-gray-200 dark:divide-gray-700">
                    <li className="pb-3 sm:pb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <img className="w-8 h-8 rounded-full" src="/user.png"></img>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                Zach Cleveland
                                </p>
                                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                email@swag.com
                                </p>
                            </div>
                            <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                <button type="button" className="bg-gray-800 text-white text-xs border border-gray-600 focus:outline-none hover:bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5">Edit</button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </Card>
    )
}

export default StudentsCard