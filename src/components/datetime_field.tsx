import { useField } from 'formik';
import React from 'react';
import { zeroPad } from '@/lib/util';

interface DatetimeFieldProps {
    name: string,
}

export const DatetimeField: React.FC<DatetimeFieldProps> = ({ name }) => {
    const [field, meta, helper] = useField<Date>(name);

    const toDateString = (date?: Date): string => {
        if (!date) return '';
        return `${date.getFullYear()}-${zeroPad(date.getMonth(), 2)}-${zeroPad(date.getDate(), 2)}`;
    };

    const toTimeString = (date?: Date): string => {
        if (!date) return '';
        return `${zeroPad(date.getHours(), 2)}:${zeroPad(date.getMinutes(), 2)}`;
    };

    return (
        <div className="w-full">
            <input
                className="w-3/5 border border-border rounded p-2 bg-primary text-white"
                type='date'
                value={toDateString(field.value)}
                onChange={(event) => {
                    let currentDate = new Date(field.value);
                    const newDayMonthYear = new Date(event.target.value);
                    currentDate.setFullYear(newDayMonthYear.getFullYear(),
                        newDayMonthYear.getMonth(),
                        newDayMonthYear.getDate());
                    currentDate.setSeconds(0);
                    currentDate.setMilliseconds(0);
                    helper.setValue(currentDate);
                }}
            />
            <input
                className="w-2/5 border border-border rounded p-2 bg-primary"
                type='time'
                value={toTimeString(field.value)}
                onChange={(event) => {
                    let currentDate = new Date(field.value);
                    const [hours, minutes] = event.target.value.split(':');
                    currentDate.setHours(parseInt(hours));
                    currentDate.setMinutes(parseInt(minutes));
                    currentDate.setSeconds(0);
                    currentDate.setMilliseconds(0);
                    helper.setValue(currentDate);
                }}
            />
        </div>
    )
}