/**
 * The 'InstructorLogin' route should allow instructors to login
 **/
import React from 'react';
import { signIn } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple, faGithub, faGoogle, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import Button from '@/components/button';
import { ProviderRecord } from './login';

const ProviderIcons: Record<string, IconDefinition> = {
    'apple': faApple,
    'github': faGithub,
    'google': faGoogle,
};

interface InstructorLoginProps {
    providers?: ProviderRecord,
    csrfToken?: string,
}
const InstructorLogin: React.FC<InstructorLoginProps> = ({ providers, csrfToken }) => {

    console.log(providers);

    return <div className="">
        <div className="w-full py-8 flex flex-col gap-4">
            <form className="w-full flex flex-col gap-4" method="post" action="/api/auth/callback/credentials">
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                <label
                    className=""
                    htmlFor="email"
                >
                    email address:

                    <input
                        className="outline outline-1 focus:outline-2 rounded w-full p-2"
                        type="email"
                        name="email"
                    />
                </label>
                <label
                    className=""
                    htmlFor="email"
                >
                    password:
                    <input
                        className="outline outline-1 focus:outline-2 rounded w-full p-2"
                        type="password"
                        name="password"
                        placeholder=''
                    />
                </label>
                <Button solid={true} action={() => { }}>Login</Button>
            </form>
            <h3 className="text-center">or</h3>
            <>
                {
                    providers && Object.values(providers).filter((provider) => provider.type === 'oauth').map((provider) => {
                        return (
                            <Button
                                key={`provider-${provider.name}`}
                                action={() => signIn(provider.id, { callbackUrl: '/' })}
                            >
                                Login with {provider.name} <FontAwesomeIcon icon={ProviderIcons[provider.id]} />
                            </Button>
                        );
                    })
                }
            </>
        </div>
    </div >
}

export default InstructorLogin