import { Dialog, Transition } from '@headlessui/react';
import { Dispatch, Fragment, SetStateAction } from 'react';

interface ModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    title: string,
    children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, title, children }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="relative z-50 w-full"
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                </Transition.Child>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full sm:max-w-xl mx-auto rounded bg-primary p-4 max-h-screen overflow-y-auto text-text-colour">
                            <Dialog.Title className="text-xl font-bold pb-4">{title}</Dialog.Title>

                            {children}
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}