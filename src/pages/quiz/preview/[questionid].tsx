/**
 * The 'Class' route allows instructors to modify their classes.  This includes
 * adding new students, modifying the existing students, and create groups of
 * students.  We also want to assign quizzes from this page
 **/
import { isStudent } from '@/lib/util';
import type { GetServerSideProps, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { gql, useQuery } from '@apollo/client';
import dynamic from 'next/dynamic';
import { QuizQuestion, User } from '@prisma/client';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { addApolloState, initializeApollo } from '@/lib/apollo';
import { QuestionView } from '@/components/question/question_type';

export const GetQuestionQuery = gql`
    query($id: String!) {
        question(id: $id) {
            id
            type
            name
            category
            content
            attribution
            user {
                id
                name
                email
            }
        }
    }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    const { questionid } = context.query

    let id = '';
    if (typeof questionid === 'string') id = questionid;

    if (session?.user && !isStudent(session)) {
        const apolloClient = initializeApollo(context.req.cookies);

        await apolloClient.query({
            query: GetQuestionQuery,
            variables: {
                id
            }
        });

        return addApolloState(apolloClient, {
            props: {
                id
            },
        });
    } else {
        return {
            props: {},
            redirect: {
                permanent: false,
                destination: '/',
            }
        };
    }
};

interface QuestionPreviewProps {
    id: string,
}

const QuestionPreview: NextPage<QuestionPreviewProps> = ({ id }) => {
    const { loading, error, data, refetch } = useQuery(GetQuestionQuery, {
        variables: { id }
    })

    console.log(data, loading, error);

    const question = data.question as QuizQuestion & {
        user: User,
    };

    return (
        <QuestionView
            question={question}
            editor={(question.content as any).source !== 'moodle'}
        />
    );
}

const PreviewNoSSR = dynamic(() => Promise.resolve(QuestionPreview), { ssr: false });
export default PreviewNoSSR;