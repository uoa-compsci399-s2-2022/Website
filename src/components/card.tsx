/**
 * Base card component & card container
 */

import React, { Children, Component, useState } from 'react'
import Link from 'next/link';

const OptionalLink: React.FC<{ children: JSX.Element, url?: string }> = ({ children, url }) => {
    return url ? <Link href={url}>{children}</Link> : children;
}

interface CardProps {
    children: React.ReactNode;
    url?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const Card: React.FC<CardProps> = ({ children, url, onClick }) => {
    return <OptionalLink url={url}>
        <a
            onClick={onClick}
            className={`left-1 block p-8 border border-border shadow-xl rounded-xl w-md mx-auto bg-primary${(onClick && ' cursor-pointer hover:bg-primary/[0.8]') ?? ''}`}
        >
            <div className='left-1 mt-4 text-gray-500 sm:pr-8 '>
                {children}
            </div>
        </a>
    </OptionalLink>;
}


export const CardContainer: React.FC<CardProps> = ({ children }) => {
    return (
        <div className='grid grid-flow-row-dense sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4'>
            {children}
        </div>
    )
}

export default Card