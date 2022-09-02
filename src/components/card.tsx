/**
 * Base card component & card container
 */

import React, { Component, useState } from 'react'

interface CardProps {
    children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({children}) => {
    return (
        <a className='left-1 block p-8 border border-border shadow-xl rounded-xl w-md mx-auto bg-primary'>
            <div className='left-1 mt-4 text-gray-500 sm:pr-8 '>
                {children}
            </div>
        </a>
    )
}


export const CardContainer: React.FC<CardProps> = ({children}) => {
    return (
        <div className='grid grid-flow-row-dense sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4'>
            {children}
        </div>
    )
}

export default Card