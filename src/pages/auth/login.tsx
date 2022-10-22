/**
 * The 'Login' route should allow users to login, selecting either the
 * student or instructor login method.
 **/
import { GetServerSideProps, NextPage } from 'next';
import dynamic from 'next/dynamic';
import { ClientSafeProvider, getCsrfToken, getProviders, LiteralUnion } from 'next-auth/react';
import StudentLogin from './_student';
import InstructorLogin from './_instructor';
import { BuiltInProviderType } from 'next-auth/providers';
import { Tabs } from '@/components/tabs';
import { useRouter } from 'next/router'

export const getServerSideProps: GetServerSideProps = async (context) => {
    const providers = await getProviders();
    const csrfToken = await getCsrfToken();
    return {
        props: { providers, csrfToken },
    }
};

export type ProviderRecord = Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>;

interface LoginProps {
    providers?: ProviderRecord,
    csrfToken?: string,
}

const Login: NextPage<LoginProps> = ({ providers, csrfToken }) => {
    const defaultGroupString = localStorage.getItem('login-last-state');
    let defaultGroup = parseInt(defaultGroupString ?? "") || 1;

    const router = useRouter()
    var { error } = router.query

    if (error && !Array.isArray(error)) {
        error = error.toString()
    }

    const codes: Record<string, string> = {
        "OAuthSignin": "Error while constructing auth URL",
        "OAuthCallback": "Could not handle the response from OAuth provider",
        "OAuthCreateAccount": "Could not create OAuth provider user in database",
        "EmailCreateAccount": "Could not create email provider user in database",
        "Callback": "Error in OAuth callback",
        "OAuthAccountNotLinked": "Email already linked to OAuth account",
        "EmailSignin": "Failed to send verifcation token email",
        "CredentialsSignin": "Authorize callback returned null",
        "SessionRequired": "Sign in required",
        "Default": "Unknown Error",
    }


    return <div className="px-2 sm:px-8 max-w-md mx-auto py-8">
        <Tabs
            pages={[
                {
                    title: 'Student',
                    content: <StudentLogin csrfToken={csrfToken} />
                },
                {
                    title: 'Instructor',
                    content: <InstructorLogin providers={providers} />,
                }
            ]}
            defaultIndex={defaultGroup ?? 1}
            onChange={(index) => {
                localStorage.setItem('login-last-state', index.toString());
            }}
        />
        {error !== undefined && typeof error === "string" &&
            <div className='bg-red-500 rounded w-1/2 h-full text-center text-white m-auto p-2'>
                <p>Error: {codes[error]}</p>
            </div>
        }

    </div>
}

/*
 * note: because I stored the page state in localStorage, we cannot render it with SSR
 */
const LoginNoSSR = dynamic(() => Promise.resolve(Login), { ssr: false });
export default LoginNoSSR;