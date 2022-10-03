/**
 * The 'QuizHistory' route should show students every quiz they have completed.
 **/
import { CardContainer } from '@/components/card';
import QuizCard from '@/components/quiz_card';
import { initializeApollo, addApolloState } from '@/lib/apollo';
import { gql, useQuery } from '@apollo/client';
import { Quiz, QuizAssignment, User } from '@prisma/client';
import { GetServerSideProps, NextPage } from 'next'
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

export const GetPreviousQuizzesQuery = gql`
    query {
        previousQuizzes {
            id
            start
            end
            quiz {
                id
                created
                name
                description
                timeLimit
            }
            assignedBy {
                id
                name
                email
            }
        }
    }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (session && session.user) {
        if (!session.user.student) {
            return {
                props: {},
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        } else {
            const apolloClient = initializeApollo(context.req.cookies);

            await apolloClient.query({
                query: GetPreviousQuizzesQuery,
            });

            return addApolloState(apolloClient, {
                props: {},
            });
        }

    } else {
        console.log('no session');
        return { props: {} }
    }
};

const QuizHistory: NextPage = () => {
    const { loading, error, data, refetch } = useQuery(GetPreviousQuizzesQuery);

    if (loading) {
        return <main>
            <h1 className="text-white text-3xl p-6">
                loading...
            </h1>
        </main>
    }

    if (error) {
        return <main>
            <h1 className="text-white text-3xl p-6">
                error {JSON.stringify(error)}
            </h1>
        </main>
    }

    const quizAssignments = data.previousQuizzes as (QuizAssignment & {
        quiz: Quiz,
        assignedBy: User,
    })[];

    return <main>

        <h1 className="text-white text-3xl p-6">
            your previous quizzes
        </h1>
        <div>
            <CardContainer>

                {
                    quizAssignments.map((assignment) => {
                        console.log(assignment);
                        return (
                            <QuizCard
                                key={`quiz-${assignment.id}`}
                                quiz={assignment.quiz}
                                assignment={assignment}
                            />
                        )
                    })
                }
            </CardContainer>
        </div>
    </main>
}

export default QuizHistory