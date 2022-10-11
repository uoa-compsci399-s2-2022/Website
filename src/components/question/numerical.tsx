import { moodleFixHtml } from '@/lib/util';
import ReactMarkdown from 'react-markdown';

interface NumericalQuestionProps {
    content: any,
    attribution?: string,
}

const NumericalQuestion: React.FC<NumericalQuestionProps> = ({ content }) => {
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
            <p>sorry, this question type isn&apos;t implemented yet</p>
        </div>
    );
}

export default NumericalQuestion;