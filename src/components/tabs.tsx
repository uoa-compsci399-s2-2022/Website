/*
 * This component is a wrapper around HeadlessUI's Tabs component.
 * This allows us to keep a consistent style, without having to duplicate
 * our tailwind code on every page that it is used.
 */
import { Tab } from '@headlessui/react';

interface TabsProps {
    pages: {
        title: string,
        content: JSX.Element,
    }[];
    defaultIndex: number,
    onChange: (index: number) => void,
}

export const Tabs: React.FC<TabsProps> = ({ pages, defaultIndex, onChange }) => {
    const tabStyle = ({ selected }: { selected: boolean }): string => {
        return 'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700' +
            '  focus:outline-none ' +
            (selected
                ? 'bg-white shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white');
    };

    return <Tab.Group
        defaultIndex={defaultIndex}
        onChange={onChange}
    >
        <div className="w-full mx-auto flex flex-col gap-2">
            <Tab.List className="w-full flex mx-auto space-x-1 rounded-xl bg-blue-900/20 p-1">
                {
                    pages.map(page => (
                        <Tab className={tabStyle} key={`tab-${page.title}`}>{page.title}</Tab>
                    ))
                }
            </Tab.List>
            <Tab.Panels>
                {
                    pages.map(page => (
                        <Tab.Panel key={`tab-content-${page.title}`}>
                            {page.content}
                        </Tab.Panel>
                    ))
                }
            </Tab.Panels>
        </div>
    </Tab.Group>
}