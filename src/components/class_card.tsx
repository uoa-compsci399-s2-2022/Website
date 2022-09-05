/**
 * Class Card
 **/
import React, { Component, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { Class, Student, User } from '@prisma/client';
import Card from './card';

interface ClassCardProps {
    _class: Class & {
        students: Student[],
        users: User[],
    };
}

const ClassCard: React.FC<ClassCardProps> = ({ _class }) => {
    return (
        <Card url={`/class/${_class.textid}/`}>
            <h5 className="mt-4 text-xl font-bold text-text-colour">{_class.name}</h5>

            <p className='hidden mt-2 text-sm sm:block text-accent'>
                <span className="block">{_class.students.length} Student{_class.students.length !== 1 && 's'}</span>
                <span className="block">{_class.users.length} Instructor{_class.users.length !== 1 && 's'}</span>
                <span className="block">{_class.students.length} Quiz{_class.students.length !== 1 && 'zes'}</span>
            </p>
        </Card>
    )
}

export default ClassCard