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
    // TODO: render any errors we get from failed login attempts
    // https://next-auth.js.org/configuration/pages#error-codes

    const defaultGroupString = localStorage.getItem('login-last-state');
    let defaultGroup = parseInt(defaultGroupString ?? "") || 1;

    return <div className="sm:px-8 max-w-md mx-auto py-8">
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
    </div>
}

/*
 * note: because I stored the page state in localStorage, we cannot render it with SSR
 */
const LoginNoSSR = dynamic(() => Promise.resolve(Login), { ssr: false });
export default LoginNoSSR;