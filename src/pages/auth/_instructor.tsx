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
}
const InstructorLogin: React.FC<InstructorLoginProps> = ({ providers }) => {

    return <div className="">
        <div className="w-full py-8 flex flex-col gap-4">
            <>
                {
                    providers && Object.values(providers).filter((provider) => provider.type === 'oauth').map((provider) => {
                        return (
                            <Button
                                theme='solid'
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