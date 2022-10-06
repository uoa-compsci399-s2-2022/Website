/**
 * The 'Quiz' route allows students to take a quiz with '_applet.tsx'.  If an instructor visits this page,
 * then they should be able to modify the contents of this quiz using '_editor.tsx'.
 **/
import { addApolloState, initializeApollo } from '@/lib/apollo'
import { isStudent } from '@/lib/util'
import { GetServerSideProps, NextPage } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { useSession } from 'next-auth/react'
import { authOptions } from '../api/auth/[...nextauth]'
import QuizApplet, { GetQuizNoAnswersQuery } from './_applet'
import QuizEditor, { GetQuizQuery } from './_editor'

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    const { quizid } = context.query;

    let id = '';
    if (typeof quizid === 'string') id = quizid;

    if (session?.user) {
        const apolloClient = initializeApollo(context.req.cookies);

        if (!isStudent(session)) {
            await apolloClient.query({
                query: GetQuizQuery,
                variables: {
                    id,
                }
            });
        } else {
            await apolloClient.query({
                query: GetQuizNoAnswersQuery,
                variables: {
                    id,
                }
            });
        }

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

interface QuizProps {
    id: string,
}

const Quiz: NextPage<QuizProps> = ({ id }) => {
    const { data: session, status } = useSession()
    const loading = status === "loading";

    // Pull data about our quiz in from the server here, then provide it to the applet or
    // the editor.

    if (!session || !session.user) return <p>aaa</p>

    return <>
        {
            session && session.user && isStudent(session) ?
                <QuizApplet
                    id={id}
                /> :
                <QuizEditor
                    id={id}
                />
        }
    </>
}

export default Quiz