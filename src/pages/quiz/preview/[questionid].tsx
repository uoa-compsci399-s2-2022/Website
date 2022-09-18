/**
 * The 'Class' route allows instructors to modify their classes.  This includes
 * adding new students, modifying the existing students, and create groups of
 * students.  We also want to assign quizzes from this page
 **/
import { isStudent } from '@/lib/util';
import type { GetServerSideProps, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { QuizQuestion } from '@prisma/client';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import DescriptionQuestion from '@/components/question/description';
import dynamic from 'next/dynamic';
import MultiChoiceQuestion from '@/components/question/multichoice';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    const { questionid } = context.query

    let id = '';
    if (typeof questionid === 'string') id = questionid;

    if (session?.user && !isStudent(session)) {
        const question = await prisma.quizQuestion.findFirst({
            where: {
                user: {
                    id: session.user.uid,
                },
                id,
            },
        });

        return {
            props: { question },
        }
    } else {
        console.log('no session');
        return { props: {} }
    }
};

interface IndexProps {
    question: QuizQuestion,
}

const QuestionPreview: NextPage<IndexProps> = ({ question }) => {
    let content = (<></>);

    switch (question.type) {
        case 'description': {
            content = <DescriptionQuestion content={question.content} />;
            break;
        };
        case 'multichoice': {
            content = <MultiChoiceQuestion content={question.content} />;
            break;
        };
        case 'numerical': {

        };
    }

    console.log(question.content);
    return (
        <div className="p-4 max-w-3xl mx-auto">
            {question && <>
                <div className="rounded-lg bg-slate-600 m-4">
                    <h1 className="text-white text-3xl p-6 text-center">
                        {question.content.name} (preview)
                    </h1>
                    {content}
                </div>
            </>}
        </div>
    );
}

const PreviewNoSSR = dynamic(() => Promise.resolve(QuestionPreview), { ssr: false });
export default PreviewNoSSR;