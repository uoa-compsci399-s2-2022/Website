import ReactMarkdown from 'react-markdown';
import { moodleFixHtml } from '@/lib/util';
import MarkdownField from '../../markdown_field';
import { QuizQuestion } from '@prisma/client';

interface DescriptionQuestionBuilderProps {

}

export const DescriptionQuestionBuilder: React.FC<DescriptionQuestionBuilderProps> = ({ }) => {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor="content-description">
                Description Text (Uses <a className="text-blue-600" href="https://www.markdownguide.org/basic-syntax/" title="Markdown Format Basics">Markdown</a> format)
            </label>
            <MarkdownField
                id="content-description"
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
        <div className="m-2 p-2">
            {
                content.source === 'moodle' ?
                    <div className="bg-white" dangerouslySetInnerHTML={{ __html: moodleFixHtml(content.label.text, content.label.image) }} />
                    :
                    <div className="prose prose-invert">
                        <ReactMarkdown>
                            {content.description}
                        </ReactMarkdown>
                    </div>
            }
        </div>
    );
}