import { Dialog } from '@headlessui/react';
import { Dispatch, SetStateAction } from 'react';

interface ModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    title: string,
    children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, title, children }) => {
    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50 w-full"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full sm:max-w-xl mx-auto rounded bg-white p-4 max-h-screen overflow-y-auto">
                    <Dialog.Title className="text-xl font-bold pb-4">{title}</Dialog.Title>

                    {children}
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}