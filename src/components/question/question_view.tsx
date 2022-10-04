import { Disclosure } from "@headlessui/react";
import { Dispatch, SetStateAction } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { QuizQuestion } from "@prisma/client";
import Link from "next/link";

interface Category {
    key: string,
    questions: QuizQuestion[],
    children: Record<string, Category>,
}

const sortQuestionsIntoCategories = (questions: QuizQuestion[], search: string): Record<string, Category> => {
    const categories: Record<string, Category> = {}
    for (const question of questions) {
        let category: Category | undefined = undefined;

        if (search.length > 0) {
            let found = false;
            if (question.name.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
                found = true;
            }
            if (question.category.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
                found = true;
            }
            if (!found) continue;
        }

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

interface CategoryComponentProps {
    name: string,
    category: Category,
    count?: number,
    selectMultiple: boolean,
    selected?: Record<string, boolean>,
    setSelected?: Dispatch<SetStateAction<Record<string, boolean>>>,
    onSelect?: (question: QuizQuestion) => void,
};

const CategoryComponent: React.FC<CategoryComponentProps> = ({ name, category, count = 0, selectMultiple, selected, setSelected, onSelect }) => {
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
                        <Disclosure.Button className="p-2 bg-slate-400 w-full inline-flex justify-left items-center text-black m-100 gap-2">
                            {
                                selectMultiple && <input
                                    type="checkbox"
                                    checked={selected['category.' + category.key] ?? false}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                    }}
                                    onChange={() => {
                                        setSelected(all => {
                                            const result = { ...all };
                                            const state = !all['category.' + category.key] ?? true;
                                            result['category.' + category.key] = state;
                                            const toVisit: Category[] = [category];
                                            while (toVisit.length > 0) {
                                                const category = toVisit.shift();
                                                for (const q of category.questions) {
                                                    result[q.id] = state;
                                                }
                                                for (const child of Object.values(category.children)) {
                                                    result['category.' + child.key] = state;
                                                    toVisit.push(child);
                                                }
                                            }
                                            return result;
                                        });
                                    }}
                                />
                            }
                            <span className="flex-grow text-left">{name}</span>
                            {/* @ts-ignore */}
                            <FontAwesomeIcon icon={faChevronDown} className={open ? '' : '-rotate-90'} />
                        </Disclosure.Button>
                        <Disclosure.Panel className="pl-4 text-black bg-slate-400">
                            <>
                                {
                                    /* show child categories */
                                    Object.keys(category.children).map((name) => {
                                        const child = category.children[name];

                                        return (
                                            <CategoryComponent
                                                key={child.key}
                                                name={name}
                                                category={child}
                                                count={count + 1}
                                                selectMultiple={selectMultiple}
                                                selected={selected}
                                                setSelected={setSelected}
                                                onSelect={onSelect}
                                            />
                                        )
                                    })
                                }
                                <div className="overflow-y-scroll max-h-80">
                                    {
                                        /* show questions in category */
                                        category.questions.map((question) => (
                                            <p
                                                key={`${category.key}.${question.id}`}
                                                className="flex items-center gap-2"
                                            >
                                                {
                                                    selectMultiple &&
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => {
                                                            setSelected(all => {
                                                                const result = { ...all };
                                                                result[question.id] = !all[question.id] ?? true;
                                                                return result;
                                                            });
                                                        }}
                                                        checked={selected[question.id] ?? false}
                                                    />
                                                }
                                                <span className="flex-grow">
                                                    {question.name}
                                                </span>
                                                <Link href={`/quiz/preview/${question.id}`} passHref>
                                                    <a target="_blank" rel="noopener noreferrer">
                                                        <FontAwesomeIcon
                                                            className={`${selectMultiple ? 'smr-4 ' : ''}cursor-pointer`}
                                                            icon={faEye}
                                                            title="View/Edit"
                                                        />
                                                    </a>
                                                </Link>
                                                {
                                                    !selectMultiple && <a onClick={() => {
                                                        onSelect(question);
                                                    }}>
                                                        <FontAwesomeIcon
                                                            className="mr-4 cursor-pointer"
                                                            icon={faPlusSquare}
                                                            title="Select"
                                                        />
                                                    </a>
                                                }
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

interface QuestionViewProps {
    questions: QuizQuestion[],
    selectMultiple: boolean,
    query?: string,
    selected?: Record<string, boolean>,
    setSelected?: Dispatch<SetStateAction<Record<string, boolean>>>,
    onSelect?: (question: QuizQuestion) => void,
}

export const QuestionView: React.FC<QuestionViewProps> = ({ questions, selectMultiple, query = '', selected, setSelected, onSelect }) => {
    const categories = sortQuestionsIntoCategories(questions, query);

    return (
        <div className="">
            {
                Object.keys(categories).map((name) => {
                    const child = categories[name];

                    return (
                        <CategoryComponent key={child.key} name={name} category={child} selectMultiple={selectMultiple} selected={selected} setSelected={setSelected} onSelect={onSelect} />
                    )
                })
            }
        </div>
    );
}