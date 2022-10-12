import React, { forwardRef, Fragment, HTMLProps } from 'react';
import Link from 'next/link';
import { Menu, Popover, Transition } from '@headlessui/react';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { isStudent } from '@/lib/util';

/*
 * A simple forwardRef to allow Next.js Links to be valid Menu items
 * Outlined in https://headlessui.com/react/menu
 */
const MenuLink = forwardRef<HTMLAnchorElement, HTMLProps<HTMLAnchorElement>>(function MenuLink(props, ref) {
    let { href, children, ...rest } = props;

    if (href === undefined) {
        throw new Error("MenuLink has invalid href 'undefined'");
    }

    return (
        <Link href={href}>
            <a ref={ref} {...rest}>
                {children}
            </a>
        </Link>
    );
});

/*
 * A component for a user dropdown menu.  This shows the users name, and contains links
 * to the users account settings, and a logout button.
 */
interface AccountControlsProps {
    session: Session
}

const AccountControls: React.FC<AccountControlsProps> = ({ session }) => {
    const buttonClassName = (active: boolean): string => {
        return (active ? 'bg-accent/[0.2] text-gray-900' : 'text-gray-700') +
            ' block px-4 py-2 text-sm';
    }

    return (
        <Menu as="div" className="relative inline-block text-left z-50">
            <div>
                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-900 shadow-sm px-4 py-2 bg-accent text-sm font-medium text-text-colour hover:bg-accent/[0.85] focus:outline-none">
                    {session.user?.name}
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Menu.Button>
            </div><Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="origin-top-left left-0 sm:left-auto sm:origin-top-right sm:right-0 absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <MenuLink href="/settings" className={buttonClassName(active)}>
                                    Account settings
                                </MenuLink>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    onClick={() => { signOut({ callbackUrl: '/' }) }}
                                    className={buttonClassName(active)}
                                >
                                    Logout
                                </a>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

/*
 * A component for the header menu.  This controls which buttons are shown in the header.
 */
interface HeaderMenuProps {
    session: Session | null
}

const STUDENT_LINKS = {
    'Upcoming': '/',
    'History': '/quiz/history'
};
const INSTRUCTOR_LINKS = {
    'Classes': '/',
    'Quizzes': '/quiz/list'
};
const VISITOR_LINKS = {
    'Home': '/',
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ session }) => {
    const router = useRouter();
    const isActive: (pathname: string) => boolean = (pathname) =>
        router.pathname === pathname;

    const links: Record<string, string> = session ? (
        isStudent(session) ? STUDENT_LINKS : INSTRUCTOR_LINKS
    ) : VISITOR_LINKS;

    return (
        <>
            <div className="text-sm sm:flex-grow">
                {
                    Object.keys(links).map((name) => {
                        const active = isActive(links[name]);
                        const colour = active ? "text-white" : "text-nav-text";
                        return (
                            <Link href={links[name]} key={`link-${name}`}>
                                <a
                                    className={`block mt-4 sm:inline-block sm:mt-0 hover:text-white mr-4 ${colour}`}
                                    data-active={active}
                                >
                                    {name}
                                </a>
                            </Link>
                        )
                    })
                }
            </div>
            <div>
                <div className="mt-4 sm:mt-0">
                    {
                        session ?
                            <AccountControls session={session} /> :
                            <Link href="/auth/login">
                                <a className="inline-flex justify-center w-full rounded-md border border-gray-900 shadow-sm px-4 py-2 bg-accent text-sm font-medium text-text-colour hover:bg-accent/[0.55] focus:outline-none">
                                    Login
                                </a>
                            </Link>
                    }
                </div>
            </div>
        </>
    );
}

/*
 * Our header component itself.  This includes the logic for both a desktop and mobile user
 * experience.
 */
const Header: React.FC = () => {
    const { data: session, status } = useSession()
    const loading = status === "loading";

    return (
        <Popover className="relative">
            <nav className="flex items-center justify-between flex-wrap bg-primary p-6">
                <div className="flex items-center flex-shrink-0 text-white mr-6">
                    <span className="font-semibold text-xl tracking-tight text-text-colour">Spatial Skills Testing</span>
                </div>
                <div className="block sm:hidden">
                    <Popover.Button className="flex items-center px-3 py-2 border rounded text-white bg-accent border-accent hover:text-white/[0.7] hover:bg-accent/[0.8] hover:border-accent/[0.7]">
                        <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <title>menu</title>
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                        </svg>
                    </Popover.Button>
                </div>
                <Popover.Panel className="w-full block flex-grow sm:flex sm:items-center sm:w-auto sm:hidden">
                    {!loading && <HeaderMenu session={session} />}
                </Popover.Panel>

                <div className="w-full hidden flex-grow sm:flex sm:items-center sm:w-auto sm:block">
                    {!loading && <HeaderMenu session={session} />}
                </div>
            </nav>
        </Popover>
    )
};

export default Header;