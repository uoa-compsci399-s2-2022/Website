import { Field, useField } from 'formik';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownFieldProps {
    id: string,
    name: string,
}

const MarkdownField: React.FC<MarkdownFieldProps> = ({ id, name }) => {
    const [input, meta, helper] = useField(name);
    const [state, setState] = useState(false);

    return (
        <div className="relative">
            {
                state ?
                    <div className="prose outline outline-1 rounded w-full p-2">
                        <ReactMarkdown >
                            {meta.value}
                        </ReactMarkdown>
                    </div> :
                    <Field
                        component="textarea"
                        rows="6"
                        id={id}
                        className="outline outline-1 focus:outline-2 rounded w-full p-2"
                        name={name}
                    />
            }
            <button
                onClick={() => setState(old => !old)}
                className="absolute top-0 right-0"
                type="button"
            >
                {state ? 'done' : 'preview'}
            </button>
        </div>
    )
}

export default MarkdownField;