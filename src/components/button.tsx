/**
 * The 'Button' component is a simple, reusable button
 **/
import React, { Component } from 'react'

interface ButtonProps {
    solid?: boolean,
    action: () => void,
    preventDefault?: boolean,
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ solid, children, action, preventDefault }) => {

    const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        action();
        if (preventDefault) {
            e.preventDefault();
        }
    }

    return <button
        onClick={onClick}
        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
    >
        {children}
    </button>
}

export default Button