/**
 * An import button for importing a quiz
 **/
import React, { useRef, useState } from 'react';
import { importQuiz } from '@/lib/util';
import Button from '../button';

interface ImportProps {
    onImport: (questions: QuizProps) => void,
}

const ImportQuiz: React.FC<ImportProps> = ({ onImport }) => {
    const fileImportRef = useRef<HTMLInputElement>(null);

    return <div className="flex gap-2 items-center z-40">
        <div>
            <Button
                action={() => {
                    fileImportRef.current?.click();
                }}
                theme='solid'
            >
                Import Quiz
            </Button>
        </div>
        <input
            ref={fileImportRef}
            type="file"
            id="file"
            accept=".json"
            onChange={
                () => importQuiz(fileImportRef.current?.files, (questions) => {
                    onImport(questions);
                    if (fileImportRef.current)
                        fileImportRef.current.value = '';
                })
            }

            hidden
        />
    </div>
}

export default ImportQuiz