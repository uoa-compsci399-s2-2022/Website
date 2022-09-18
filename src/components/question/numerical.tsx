import { moodleFixHtml } from '@/lib/util';

interface NumericalQuestionProps {
    content: any,
    attribution?: string,
}

const NumericalQuestion: React.FC<NumericalQuestionProps> = ({ content }) => {
    return (
        <div className="m-2 p-2 bg-white">
            <div dangerouslySetInnerHTML={{ __html: moodleFixHtml(content.label.text, content.label.image) }} />
        </div>
    );
}

export default NumericalQuestion;