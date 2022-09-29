/**
 * The 'QuizList' route should show instructors every quiz they have access to.
 **/
import { GetServerSideProps, NextPage } from 'next'
import { useState } from 'react';
import { unstable_getServerSession } from 'next-auth';
import { Quiz, QuizAssignment, QuizQuestion, User } from '@prisma/client';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Disclosure } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import Link from 'next/link';
import Card, { CardContainer } from '@/components/card';
import QuizCard from '@/components/quiz_card';
import { QuizCreator } from '@/components/quiz_creator';
import ImportQuestions from '@/components/question_import';
import { authOptions } from '../api/auth/[...nextauth]';
import { isStudent } from '@/lib/util';
import { addApolloState, initializeApollo } from '@/lib/apollo';
import Button from '@/components/button';
import { QuestionCreator } from '@/components/question_creator';

const GetQuestionsQuery = gql`
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

const GetQuizzesQuery = gql`
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

const CreateQuestionMutation = gql`
    mutation($type: String!, $name: String!, $category: String!, $content: JSON!, $attribution: String) {
        createQuestion(type: $type, name: $name, category: $category, content: $content, attribution: $attribution) {
            id
        }
    }
`

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (session?.user && !isStudent(session)) {
        const apolloClient = initializeApollo(context.req.cookies);

        await apolloClient.query({
            query: GetQuestionsQuery
        });
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

interface Category {
    key: string,
    questions: QuizQuestion[],
    children: Record<string, Category>,
}

const sortQuestionsIntoCategories = (questions: QuizQuestion[]): Record<string, Category> => {
    const categories: Record<string, Category> = {}
    for (const question of questions) {
        let category: Category | undefined = undefined;

        const categoryDirectory = question.category.split('/');
        for (const categoryName of categoryDirectory) {
            let parent: Record<string, Category> = categories;
            if (category !== undefined) {
                parent = category.children;
            }
            if (categoryName in parent) {
                category = parent[categoryName];
            } else {
                parent[categoryName] = {
                    key: ((category && category.key + '.') ?? '') + categoryName,
                    questions: [],
                    children: {},
                }
                category = parent[categoryName];
            }
        }

        if (!category) {
            console.error('failed to find category', question.category);
        } else {
            category.questions.push(question);
        }

    }
    return categories;
};

const CategoryComponent: React.FC<{ name: string, category: Category, count: number }> = ({ name, category, count = 0 }) => {
    var colour: string
    if (count % 2 == 0) {
        colour = "border-background"
    } else {
        colour = "border-accent"
    }

    return (
        <Disclosure>
            {({ open }) => (
                <div className="pb-4">
                <div className={`border-l-4 ${colour}`}>
                    <Disclosure.Button className="p-2 bg-slate-400 w-full inline-flex justify-left items-center text-black m-100">
                        <svg className={`mr-2 h-5 w-5 ${open ? '' : '-rotate-90'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {name}
                    </Disclosure.Button>
                    <Disclosure.Panel className="pl-4 text-black bg-slate-400">
                        <>
                            {
                                /* show child categories */
                                Object.keys(category.children).map((name) => {
                                    const child = category.children[name];

                                    return (
                                        <CategoryComponent key={child.key} name={name} category={child} count={count+1} />
                                    )
                                })
                            }
                            <div className="overflow-y-scroll max-h-80">
                                {
                                    /* show questions in category */
                                    category.questions.map((question) => (
                                        <p
                                            key={`${category.key}.${question.id}`}
                                            className="flex items-center"
                                        >
                                            <span className="flex-grow">{
                                                question.name
                                            }</span>
                                            <Link href={`/quiz/preview/${question.id}`} passHref>
                                                <a target="_blank" rel="noopener noreferrer">
                                                    <FontAwesomeIcon
                                                        className="mr-2 cursor-pointer"
                                                        icon={faEye}
                                                        title="Preview"
                                                    />
                                                </a>
                                            </Link>
                                            <a onClick={() => { }}>
                                                <FontAwesomeIcon
                                                    className="mr-2 cursor-pointer"
                                                    icon={faEdit}
                                                    title="Edit"
                                                />
                                            </a>
                                            <a onClick={() => { }}>
                                                <FontAwesomeIcon
                                                    className="mr-2 cursor-pointer"
                                                    icon={faTrashCan}
                                                    title="Delete"
                                                />
                                            </a>
                                        </p>
                                    ))
                                }
                            </div>
                        </>
                    </Disclosure.Panel>
                </div>
            </div>
            )}
        </Disclosure>
    );
}

const QuizList: NextPage = ({ }) => {
    const [quizCreatorOpen, setQuizCreatorOpen] = useState(false);
    const [questionCreatorOpen, setQuestionCreatorOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { data: quizData } = useQuery(GetQuizzesQuery);
    const { data: questionData, refetch } = useQuery(GetQuestionsQuery);
    const [createQuestion] = useMutation(CreateQuestionMutation);

    const quizzes = quizData.quizzes as (Quiz & {
        user: User,
        assignments: QuizAssignment[],
        questions: (QuizQuestion | null)[]
    })[];

    const questions = questionData.questions as (QuizQuestion & {
        user: User,
    })[];

    const categories = sortQuestionsIntoCategories(questions);

    const uploadQuestions = async (questions: QuizQuestionProps[]) => {
        setUploading(true);

        for (const question of questions) {
            try {
                await createQuestion({
                    variables: {
                        ...question
                    }
                });
            } catch (error) {
                alert(error.toString());
                setUploading(false);
            }
        }

        refetch();
    }

    return (
        <main>
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2">
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
                <div className="w-full md:w-1/2">
                    <div className="rounded-lg bg-slate-600 m-4">
                        <div className="flex flex-row p-6 gap-2">
                            <h1 className="text-white text-3xl flex-grow">
                                your questions
                            </h1>
                            <Button solid={true} action={() => setQuestionCreatorOpen(true)}>New</Button>
                            <ImportQuestions onImport={(questions) => { uploadQuestions(questions) }} />
                        </div>
                        <div className="px-4">
                            {
                                Object.keys(categories).length === 0 && <p className="text-white pb-4">{uploading ? 'uploading...' : 'you have no questions'}</p>
                            }
                            {
                                Object.keys(categories).map((name) => {
                                    const child = categories[name];

                                    return (
                                        <CategoryComponent key={child.key} name={name} category={child} />
                                    )
                                })
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
            />
        </main>
    );
}

export default QuizList