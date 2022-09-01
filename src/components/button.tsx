/**
 * The 'Button' component is a simple, reusable button
 **/
import React, { Component } from 'react'

interface ButtonProps {
    solid?: boolean,
    disabled?: boolean,
    action: () => void,
    preventDefault?: boolean,
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ solid, disabled, children, action, preventDefault }) => {

    const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        action();
        if (preventDefault) {
            e.preventDefault();
        }
    }

    let colour = solid ?
        'border-gray-300 bg-orange-500 text-gray-100 hover:bg-orange-600'
        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';

    return <button
        onClick={onClick}
        className={`inline-flex gap-2 items-center justify-center rounded-md border shadow-sm px-4 py-2 text-sm font-medium focus:outline-none ${colour}`}
        disabled={disabled}
    >
        {children}
    </button>
}

export default Button