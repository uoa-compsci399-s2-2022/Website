import { useField } from 'formik';
import React from 'react';

interface DatetimeFieldProps {
    name: string,
}

export const DatetimeField: React.FC<DatetimeFieldProps> = ({ name }) => {
    const [field, meta, helper] = useField<Date>(name);

    return (
        <div className="w-full">
            <input
                className="w-3/5 outline outline-1 focus:outline-2 rounded p-2 bg-slate-800 text-white accent-white"
                type='date'
            />
            <input
                className="w-2/5 outline outline-1 focus:outline-2 rounded p-2 bg-slate-800"
                type='time'
            />
        </div>
    )
}