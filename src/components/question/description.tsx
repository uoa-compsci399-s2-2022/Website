import { moodleFixHtml } from '@/lib/util';

interface DescriptionQuestionProps {
    content: any,
    attribution?: string,
}

const DescriptionQuestion: React.FC<DescriptionQuestionProps> = ({ content }) => {
    return (
        <div className="m-2 p-2 bg-white">
            <div dangerouslySetInnerHTML={{ __html: moodleFixHtml(content.label.text, content.label.image) }} />
        </div>
    );
}

export default DescriptionQuestion;