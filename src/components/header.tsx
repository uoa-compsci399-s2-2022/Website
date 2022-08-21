import React, { forwardRef, Fragment, HTMLProps } from 'react';
import { Menu, Popover, Transition } from '@headlessui/react'
import styles from '@/styles/Home.module.css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight } from '@fortawesome/free-regular-svg-icons';
import { signOut } from 'next-auth/react';

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

/* this is our dropdown box, which allows users to manage their account */
const AccountControls: React.FC = () => {
    const buttonClassName = (active: boolean): string => {
        return (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700') +
            ' block px-4 py-2 text-sm';
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                    Zac Cleveland
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
                                    account settings
                                </MenuLink>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    onClick={() => { signOut({ callbackUrl: '/' }) }}
                                    className={buttonClassName(active)}
                                >
                                    logout
                                </a>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

const HeaderMenu: React.FC = () => {
    // TODO: logged in (student) => tests (home), history, account controls
    // TODO: logged in (instructor) => classes (home), tests, account controls
    // TODO: logged out => just account controls
    return (
        <>
            <div className="text-sm sm:flex-grow">
                <Link href="/">
                    <a className="block mt-4 sm:inline-block sm:mt-0 text-orange-200 hover:text-white mr-4">
                        upcoming
                    </a>
                </Link>
                {/* when instructor logged in, change this to /quiz/list */}
                <Link href="/quiz/history">
                    <a className="block mt-4 sm:inline-block sm:mt-0 text-orange-200 hover:text-white mr-4">
                        history
                    </a>
                </Link>
            </div>
            <div>
                <div className="mt-4 sm:mt-0">
                    <AccountControls />
                </div>
            </div>
        </>
    );
}

const Header: React.FC = () => {
    // TODO: show 'logout' if signed in, otherwise show nothing
    return (
        <Popover className="relative">
            <nav className="flex items-center justify-between flex-wrap bg-orange-600 p-6">
                <div className="flex items-center flex-shrink-0 text-white mr-6">
                    <span className="font-semibold text-xl tracking-tight">spatial skills testing</span>
                </div>
                <div className="block sm:hidden">
                    <Popover.Button className="flex items-center px-3 py-2 border rounded text-orange-200 border-orange-400 hover:text-white hover:border-white">
                        <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <title>menu</title>
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                        </svg>
                    </Popover.Button>
                </div>
                <Popover.Panel className="w-full block flex-grow sm:flex sm:items-center sm:w-auto">
                    <HeaderMenu />
                </Popover.Panel>

                <div className="w-full hidden flex-grow sm:flex sm:items-center sm:w-auto sm:block">
                    <HeaderMenu />
                </div>
            </nav>
        </Popover>
    )
};

export default Header;