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

interface Colours {
    [key: string]: {
        enabled: string,
        disabled: string,
    }
}

const colours: Colours = {
    solid: {
        enabled: 'border-gray-300 bg-orange-500 text-gray-100 hover:bg-orange-600',
        disabled: 'border-gray-300 bg-orange-300 text-gray-100',
    },
    not_solid: {
        enabled: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        disabled: 'border-gray-300 bg-grey-300 text-gray-400',
    }
}

const Button: React.FC<ButtonProps> = ({ solid, disabled, children, action, preventDefault }) => {

    const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        action();
        if (preventDefault) {
            e.preventDefault();
        }
    }

    let colour = colours[solid ? 'solid' : 'not_solid'][disabled ? 'disabled' : 'enabled'];

    return <button
        onClick={onClick}
        className={`inline-flex gap-2 items-center justify-center rounded-md border shadow-sm px-4 py-2 text-sm font-medium focus:outline-none ${colour}`}
        disabled={disabled}
    >
        {children}
    </button>
}

export default Button