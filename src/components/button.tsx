/**
 * The 'Button' component is a simple, reusable button
 **/
import React, { Component } from 'react'

type Theme = 'solid' | 'grey' | 'danger' | 'passive';

export type ButtonTheme = Theme;

interface ButtonProps {
    theme?: Theme,
    disabled?: boolean,
    action: () => void,
    preventDefault?: boolean,
    children?: React.ReactNode;
    type?: "button" | "submit" | "reset",
}

type Colours = {
    [key in Theme]: {
        enabled: string;
        disabled: string;
    };
};

const colours: Colours = {
    solid: {
        enabled: 'border-blue-600 bg-blue-700 text-text-colour hover:bg-blue-800',
        disabled: 'border-gray-300 bg-background text-text-colour',
    },
    grey: {
        enabled: 'border-gray-300 bg-background text-text-colour-700 hover:bg-gray-500',
        disabled: 'border-gray-300 bg-background text-text-colour',
    },
    danger: {
        enabled: 'border-red-400 bg-red-500 text-white hover:bg-red-600',
        disabled: 'border-gray-300 bg-background text-text-colour',
    },
    passive: {
        enabled: 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700',
        disabled: 'border-gray-300 bg-background text-text-colour',
    }
}

const Button: React.FC<ButtonProps> = ({ theme, disabled, children, action, preventDefault, type }) => {

    const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        action();
        if (preventDefault) {
            e.preventDefault();
        }
    }

    let colour = colours[theme ?? 'grey'][disabled ? 'disabled' : 'enabled'];

    return <button
        type={type}
        onClick={onClick}
        className={`inline-flex gap-2 items-center justify-center rounded-md border shadow-sm px-4 py-2 text-sm font-medium focus:outline-none ${colour}`}
        disabled={disabled}
    >
        {children}
    </button>
}

export default Button