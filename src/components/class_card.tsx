/**
 * Class Card
 **/
import React, { Component, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { Class } from '@prisma/client';
import Card from './card';

interface ClassCardProps {
    _class: Class;
}

const ClassCard: React.FC<ClassCardProps> = ({ _class }) => {
    return (
        <div className=''>
            <Card url={`/class/${_class.textid}/`}>
                <h5 className="mt-4 text-xl font-bold text-text-colour">{_class.name}</h5>

                <p className='hidden mt-2 text-sm sm:block text-accent'>
                    Description of quiz
                </p>
            </Card>
        </div>
    )
}

export default ClassCard