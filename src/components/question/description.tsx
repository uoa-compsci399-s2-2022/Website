import { moodleFixHtml } from '@/lib/util';
import { Field, useField } from 'formik';

interface DescriptionQuestionBuilderProps {

}

export const DescriptionQuestionBuilder: React.FC<DescriptionQuestionBuilderProps> = ({ }) => {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor="content-description">
                Description Text (Uses <a className="text-blue-600" href="https://www.markdownguide.org/basic-syntax/" title="Markdown Format Basics">Markdown</a> format)
            </label>
            <Field
                component="textarea"
                rows="4"
                id="content-description"
                className="outline outline-1 focus:outline-2 rounded w-full p-2"
                name="content.description"
            />
        </div>
    );
}

interface DescriptionQuestionProps {
    content: any,
    attribution?: string,
}

export const DescriptionQuestion: React.FC<DescriptionQuestionProps> = ({ content }) => {
    return (
        <div className="m-2 p-2 bg-white">
            <div dangerouslySetInnerHTML={{ __html: moodleFixHtml(content.label.text, content.label.image) }} />
        </div>
    );
}