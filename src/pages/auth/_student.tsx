/**
 * The 'StudentLogin' route should allow students to login
 **/
import React, { useRef } from 'react';
import Button from '@/components/button';
import { signIn } from 'next-auth/react';

interface StudentLoginProps {
    csrfToken?: string,
}

const StudentLogin: React.FC<StudentLoginProps> = ({ csrfToken }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return <div className="">
        <div className="w-full py-2 flex flex-col gap-4">
            <form className="w-full flex flex-col gap-4" method="post" action="/api/auth/callback/credentials">
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                <label className="text-text-colour text-left text-xl" htmlFor="passcode">

                    <input
                        className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                        type="password"
                        name="passcode"
                        ref={inputRef}
                        placeholder="Passcode"
                    />
                </label>
                <Button theme='solid' action={() => {
                    const passcode = inputRef.current?.value;
                    console.log(passcode);
                    signIn('passcode', {
                        passcode,
                        callbackUrl: '/',
                    });
                }} preventDefault={true}>Go</Button>
            </form>
        </div>
    </div >
}

export default StudentLogin