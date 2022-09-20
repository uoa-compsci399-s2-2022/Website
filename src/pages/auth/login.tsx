/**
 * The 'Login' route should allow users to login, selecting either the
 * student or instructor login method.
 **/
import { GetServerSideProps, NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Tab } from '@headlessui/react';
import { ClientSafeProvider, getCsrfToken, getProviders, LiteralUnion } from 'next-auth/react';
import StudentLogin from './_student';
import InstructorLogin from './_instructor';
import { BuiltInProviderType } from 'next-auth/providers';

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

    const tabStyle = ({ selected }: { selected: boolean }): string => {
        return 'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700' +
            ' ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ' +
            (selected
                ? 'bg-white shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white');
    };

    return <Tab.Group
        defaultIndex={defaultGroup ?? 1}
        onChange={(index) => {
            localStorage.setItem('login-last-state', index.toString());
        }}
    >
        <div className="w-full max-w-md px-2 py-8 sm:px-8 mx-auto">
            <Tab.List className="w-full max-w-md flex mx-auto space-x-1 rounded-xl bg-blue-900/20 p-1">
                <Tab className={tabStyle}>Student</Tab>
                <Tab className={tabStyle}>Instructor</Tab>
            </Tab.List>
            <Tab.Panels>
                <Tab.Panel><StudentLogin csrfToken={csrfToken} /></Tab.Panel>
                <Tab.Panel><InstructorLogin providers={providers} /></Tab.Panel>
            </Tab.Panels>

        </div>
    </Tab.Group>
}

/*
 * note: because I stored the page state in localStorage, we cannot render it with SSR
 */
const LoginNoSSR = dynamic(() => Promise.resolve(Login), { ssr: false });
export default LoginNoSSR;