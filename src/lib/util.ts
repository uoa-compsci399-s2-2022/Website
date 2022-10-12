import { Session } from "next-auth"
import { parse } from 'csv-parse';
import { XMLParser } from 'fast-xml-parser';
import { stringify } from 'querystring';
import { QuizQuestion } from '@prisma/client';
import { gql } from '@apollo/client';

// https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript
export const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');


export const isStudent = (session?: Session): boolean => {
    return (session && session.user && 'student' in session.user) ?? false;
}

type OnImportStudentsFunc = (students: ImportedStudent[]) => void;

export const importStudentsCSV = async (files: FileList | null | undefined, onImport: OnImportStudentsFunc): Promise<void> => {
    if (!files || files.length === 0) return;

    const students: ImportedStudent[] = [];
    const parser = parse({
        delimiter: ','
    })

    parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null) {
            if (record.length < 2) {
                throw Error('Invalid CSV file, please include a name and passcode for each student');
            } else if (record.length > 3) {
                throw Error('Invalid CSV file, too many values in row');
            }
            const [name, passcode] = record;
            const student: ImportedStudent = {
                name,
                passcode,
            };
            if (record.length === 3) student.email = record[3];
            students.push(student);
        }
    });

    parser.on('error', function (err) {
        alert('Failed to parse students CSV, ' + err.message)
    });

    parser.on('end', function () {
        onImport(students);
    });

    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;

        parser.write(await file.text());
    }

    parser.end();
};

type OnImportQuestionsFunc = (questions: QuizQuestionProps[]) => void;

type MoodleAnswer = { score: number, text: string, feedback: string };

const moodleParseAnswers = (answer: any): MoodleAnswer[] | MoodleAnswer => {
    if (Array.isArray(answer)) {
        return answer.map(({ attributes, text, feedback }) => {
            return { score: attributes.fraction, text, feedback: feedback.text };
        });
    } else {
        const { attributes, text, feedback } = answer;
        return { score: attributes.fraction, text, feedback: feedback.text };
    }
}

const importQuestionsXML = async (file: File, onImport: OnImportQuestionsFunc): Promise<void> => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        attributesGroupName: 'attributes'
    });
    let xmlDoc = parser.parse(await file.text());
    if (!('quiz' in xmlDoc)) {
        return;
    }
    const quiz = xmlDoc.quiz;
    if (!('question' in quiz)) {
        return;
    }
    const questions: QuizQuestionProps[] = [];

    let category: string = '';
    for (const question of quiz.question) {
        if (!('attributes' in question)) {
            continue;
        }
        if (!('type' in question.attributes)) {
            continue;
        }
        const type = question.attributes.type;
        switch (type.toLowerCase()) {
            case 'category': {
                if (question.category && question.category.text)
                    category = question.category.text;
                break;
            };
            case 'description': {
                try {
                    const content = {
                        source: "moodle",
                        label: {
                            text: question.questiontext.text,
                            image: question.questiontext.file,
                            format: question.questiontext.attributes.format,
                        }
                    };

                    questions.push({
                        type: 'description',
                        name: question.name.text,
                        category,
                        content,
                        attribution: '',
                    });
                } catch (e) {
                    console.error('Error while parsing quiz question');
                    console.error(e);
                }
                break;
            };
            case 'multichoice': {
                try {
                    const content = {
                        source: "moodle",
                        label: {
                            text: question.questiontext.text,
                            image: question.questiontext.file,
                            format: question.questiontext.attributes.format,
                        },
                        single: question.single,
                        shuffle: question.shuffleanswers === 1,
                        numbering: question.answernumbering,
                        answers: moodleParseAnswers(question.answer),
                        feedback: {
                            correct: question.correctfeedback.text,
                            partial: question.partiallycorrectfeedback.text,
                            incorrect: question.incorrectfeedback.text,
                        }
                    };

                    questions.push({
                        type: 'multichoice',
                        name: question.name.text,
                        category,
                        content,
                        attribution: '',
                    });
                } catch {
                    console.error('Error while parsing quiz question');
                }
                break;
            };
            case 'numerical': {
                try {
                    const content = {
                        source: "moodle",
                        label: {
                            text: question.questiontext.text,
                            image: question.questiontext.file,
                            format: question.questiontext.attributes.format,
                        },
                        answers: moodleParseAnswers(question.answer),
                    };

                    questions.push({
                        type: 'numerical',
                        name: question.name.text,
                        category,
                        content,
                        attribution: '',
                    });
                } catch (e) {
                    console.error('Error while parsing quiz question');
                    console.error(e);
                }
                break;
            };
            default: {
                console.error(`XML Import: Question type ${type} not implemented`);
                continue;
            }
        }
    }

    onImport(questions);
    console.log(questions);
};

const importQuestionsJSON = async (file: File, onImport: OnImportQuestionsFunc): Promise<void> => {
    const text = await file.text();
    const jsonObject = JSON.parse(text);

    onImport(jsonObject);
};

export const importQuestions = async (files: FileList | null | undefined, onImport: OnImportQuestionsFunc): Promise<void> => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type === 'text/xml') {
        await importQuestionsXML(file, onImport);
    } else if (file.type === 'application/json') {
        await importQuestionsJSON(file, onImport);
    }
};

const saveFileAsString = (text: string, type: string, name: string) => {
    let fileElement = document.createElement('a');
    fileElement.href = window.URL.createObjectURL(new Blob([text], {
        type
    }));
    fileElement.download = name;
    fileElement.click();
    fileElement.remove();
}

export const exportQuestionsJSON = async (questions: QuizQuestion[]) => {
    saveFileAsString(JSON.stringify(questions), 'application/json', `questions-export-${questions.length}-${new Date().toISOString()}.json`);
}

export const moodleFixHtml = (html: string, image: any): string => {
    let images = [];
    if (Array.isArray(image)) {
        images = [...image];
    } else {
        images = [image];
    }

    const parser = new window.DOMParser();
    const htmlDoc = parser.parseFromString(html, 'text/html');
    const imageElements = Array.from(htmlDoc.getElementsByTagName('img'));

    for (const image of imageElements) {
        const url = new URL(image.src);
        const path = url.pathname;
        if (path.indexOf('@@PLUGINFILE@@') > 0) {
            const [_, name] = path.split('@@PLUGINFILE@@/');
            const unescaped = decodeURI(name);
            const matchingImages = images.filter((img) => {
                return img.attributes.name === unescaped;
            });
            if (matchingImages.length > 0) {
                const matchingImage = matchingImages[0];
                image.src = 'data:image/jpeg;base64,' + matchingImage['#text'];
            }
        } else if (path.indexOf('googleusercontent')) {
            image.referrerPolicy = 'no-referrer'
        }
    }

    return htmlDoc.body.innerHTML;
}

export const questionRemoveAnswers = (question: QuizQuestion) => {
    console.error('questionRemoveAnswers is unimplemented!');
    return question;
};

export const questionGrade = (question: QuizQuestion, answer: SessionAnswer): number => {
    const content = question.content as any;
    if (content.source === 'moodle') {
        switch (question.type as QuestionType) {
            case 'description': {
                return 0;
            }
            case 'multichoice': {
                if (answer.type !== 'multichoice') {
                    return;
                }
                if (content.single && typeof answer.answer === 'number') {
                    return content.answers[answer.answer].score;
                } else if (Array.isArray(answer.answer)) {
                    return answer.answer
                        .map((ans: number) => parseInt(content.answers[ans].score))
                        .reduce((a: number, b: number) => a + b, 0);
                } else {
                    console.error('Error - mismatched question type and answer');
                    return 0;
                }
            }
            case 'numerical': {
                console.error('unimplemented: question grade (numerical)');
            }
            case 'memory_game': {
                console.error('unimplemented: question grade (memory_game)');
            }
        }
    } else {

    }
}