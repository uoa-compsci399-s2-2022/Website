/**
 * The 'QuizList' route should show instructors every quiz they have access to.
 **/
import { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState } from 'react';
import { unstable_getServerSession } from 'next-auth';
import { Quiz, QuizAssignment, QuizQuestion, User } from '@prisma/client';
import { gql, useMutation, useQuery } from '@apollo/client';
import Card, { CardContainer } from '@/components/card';
import QuizCard from '@/components/quiz/quiz_card';
import { QuizCreator } from '@/components/quiz/quiz_creator';
import ImportQuestions from '@/components/question/question_import';
import { authOptions } from '../api/auth/[...nextauth]';
import { isStudent } from '@/lib/util';
import { addApolloState, initializeApollo } from '@/lib/apollo';
import Button from '@/components/button';
import { QuestionCreator } from '@/components/question/question_creator';
import { LoadingSpinner } from '@/components/loading';
import { QuestionView } from '@/components/question/question_view';
import ExportQuestions from '@/components/question/question_export';

export const GetQuestionsQuery = gql`
    query {
        questions {
            id
            type
            name
            category
            attribution
            user {
                id
                name
                email
            }
        }
    }
`;

export const GetQuizzesQuery = gql`
    query {
        quizzes {
            id
            created
            name
            description
            timeLimit
            user {
                id
                name
                email
            }
            assignments {
                id
                start
                end
            }
            questions {
                id
            }
        }
    }
`;

export const CreateQuestionMutation = gql`
    mutation($type: String!, $name: String!, $category: String!, $content: JSON!, $attribution: String) {
        createQuestion(type: $type, name: $name, category: $category, content: $content, attribution: $attribution) {
            id
        }
    }
`;

const DeleteQuestionMutation = gql`
    mutation($id: String!) {
        deleteQuestion(id: $id) {
            id
        }
    }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (session?.user && !isStudent(session)) {
        const apolloClient = initializeApollo(context.req.cookies);

        /*
        await apolloClient.query({
            query: GetQuestionsQuery
        });
        */
        await apolloClient.query({
            query: GetQuizzesQuery
        });

        return addApolloState(apolloClient, {
            props: {},
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



const QuizList: NextPage = ({ }) => {
    const [quizCreatorOpen, setQuizCreatorOpen] = useState(false);
    const [questionCreatorOpen, setQuestionCreatorOpen] = useState(false);
    const [loadState, setLoadState] = useState<string | undefined>(undefined);
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [questionSearch, setQuestionSearch] = useState('');

    const { data: quizData } = useQuery(GetQuizzesQuery);
    const { data: questionData, refetch, loading: questionsLoading } = useQuery(GetQuestionsQuery);
    const [createQuestion] = useMutation(CreateQuestionMutation);
    const [deleteQuestion] = useMutation(DeleteQuestionMutation);

    useEffect(() => {
        setSelected({});
    }, [])

    const quizzes = quizData.quizzes as (Quiz & {
        user: User,
        assignments: QuizAssignment[],
        questions: (QuizQuestion | null)[]
    })[];

    const questions = questionsLoading ? [] : questionData.questions as (QuizQuestion & {
        user: User,
    })[];

    const questionMap: Record<string, QuizQuestion> = {};
    for (const question of questions) {
        questionMap[question.id] = question;
    }

    const uploadQuestions = async (questions: QuizQuestionProps[]) => {
        setLoadState('Uploading');

        for (const question of questions) {
            try {
                await createQuestion({
                    variables: {
                        ...question
                    }
                });
            } catch (error) {
                alert(error.toString());
                setLoadState(undefined);
            }
        }

        await refetch();
        setLoadState(undefined);
    }

    const deleteSelected = async () => {
        const selectedQuestions = Object.entries(selected)
            .filter(([k, v]) => v && !k.startsWith('category.'));

        console.log(selectedQuestions);

        for (const [id,] of selectedQuestions) {
            setLoadState('Deleting');
            try {
                await deleteQuestion({
                    variables: {
                        id,
                    }
                });
            } catch (error) {
                alert(`Failed to delete question ${id}: ${error}`);
                setLoadState(undefined);
                return;
            }
            setSelected({});
        }
        setLoadState(undefined);
        await refetch();
    };

    const selectedQuestionIds = Object.entries(selected)
        .filter(([k, v]) => v && !k.startsWith('category.'))
        .map(([k,]) => k);

    return (
        <main>
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/2">
                    <div className="rounded-lg bg-slate-600 m-4">
                        <h1 className="text-white text-3xl p-6">
                            your quizzes
                        </h1>
                        <CardContainer>
                            {
                                /* we have no quizzes loaded yet */
                                quizzes.map((data, index: number) => {
                                    return (
                                        <QuizCard quiz={data} key={`quiz-${index}`} />
                                    );
                                })
                            }
                            <Card onClick={() => setQuizCreatorOpen(true)}>
                                <h1 className="mt-4 text-xl font-bold text-text-colour w-full text-center">create new quiz</h1>
                            </Card>
                        </CardContainer>
                    </div>
                </div>
                <div className="w-full lg:w-1/2">
                    <div className="rounded-lg bg-slate-600 m-4 p-4">
                        <div className="flex flex-row p-2 gap-2">
                            <h1 className="text-white text-3xl flex-grow">
                                your questions
                            </h1>
                            <input
                                type="text"
                                placeholder="Search"
                                className="rounded px-2"
                                onChange={(event) => {
                                    setQuestionSearch(event.target.value);
                                }}
                            />
                            <ImportQuestions onImport={(questions) => { uploadQuestions(questions) }} />
                        </div>
                        <div className="pt-2">
                            {
                                !questionsLoading && !loadState && questions.length === 0 &&
                                <p className="text-white pb-4">{'You have no questions.'}</p>
                            }
                            {
                                questionsLoading && <p className="text-white pb-4 flex gap-2 items-center">
                                    <LoadingSpinner /> Loading questions
                                </p>
                            }
                        </div>
                        {
                            !questionsLoading && questions.length > 0 &&
                            <QuestionView
                                questions={questions}
                                selectMultiple={true}
                                query={questionSearch}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        }
                        <div className="flex gap-2 items-center">
                            <Button theme='solid' action={() => setQuestionCreatorOpen(true)}>Create Question</Button>
                            {
                                selectedQuestionIds.length > 0 &&
                                <>
                                    <Button
                                        theme='danger'
                                        action={() => deleteSelected()}
                                    >
                                        Delete {selectedQuestionIds.length} selected
                                    </Button>
                                    <ExportQuestions
                                        selected={selectedQuestionIds}
                                        onStart={() => setLoadState('Exporting')}
                                        onComplete={() => setLoadState(undefined)}
                                    />
                                    {loadState && <p className="text-white pb-4 flex gap-2 items-center">
                                        <LoadingSpinner /> {loadState}
                                    </p>}
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>

            <QuizCreator
                isOpen={quizCreatorOpen}
                setIsOpen={setQuizCreatorOpen}
                editor={false}
            />
            <QuestionCreator
                isOpen={questionCreatorOpen}
                setIsOpen={setQuestionCreatorOpen}
                doRefetch={() => refetch()}
            />
        </main>
    );
}

export default QuizList