/*
 * This field allows the user to select mutliple of a type using a combo box.
 * For example, this allows the user to select students to assign a quiz to.
 */

import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FieldArray, useField } from 'formik';
import { useState } from 'react';
import Button from './button';
import { Selector } from './selector';

interface ListFieldProps<T> {
    name: string,
    values: T[],
    _key: (value: T) => string,
    display: (value?: T) => string,
    filter: (value: T, search: string) => boolean,
}

export function ListField<T>({ name, values, _key, display, filter }: ListFieldProps<T>): JSX.Element {
    const [field, meta, helper] = useField<T[]>(name);
    const [selected, setSelected] = useState(values[0]);

    return (
        <FieldArray
            name={name}
            render={helpers => (
                <div className="flex flex-col gap-2">
                    {
                        meta.value && meta.value.length > 0 &&
                        meta.value.map((value: T, index: number) => (
                            <div className="flex flex-col gap-1" key={_key(value)}>
                                <div className="flex gap-2">
                                    <p
                                        className="outline outline-1 focus:outline-2 rounded w-full p-2"
                                    >
                                        {display(value)}
                                    </p>
                                    <Button
                                        action={() => { helpers.remove(index) }}
                                        preventDefault={true}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    }
                    <div className="flex gap-2">
                        <Selector
                            value={selected}
                            values={values}
                            onChange={setSelected}
                            display={display}
                            filter={filter}
                            _key={_key}
                        />
                        <Button
                            action={() => {
                                helpers.push(selected);
                            }}
                            preventDefault={true}
                        >
                            Add
                        </Button>
                    </div>
                    <p className="text-xs mb-2 flex">
                        <span className="flex-grow">Count: {meta.value.length}</span>
                    </p>
                </div>
            )}
        />
    )
}