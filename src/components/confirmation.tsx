import { Dispatch, SetStateAction, useState } from "react";
import Button, { ButtonTheme } from "./button";
import { LoadingSpinner } from "./loading";
import { Modal } from "./modal";

interface ConfirmationProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>
    title: string,
    message: string,
    yesTheme?: ButtonTheme,
    yes?: string,
    onYes?: () => void,
    noTheme?: ButtonTheme,
    no?: string,
    onNo?: () => void,
}

export const Confirmation: React.FC<ConfirmationProps> = ({ isOpen, setIsOpen, title, message, ...buttons }) => {
    const [loading, setLoading] = useState(false);
    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={title}
        >
            <p className="text-md text-white">{message}</p>

            <div className="flex gap-2 items-center pt-2">
                <Button
                    theme={buttons.yesTheme ?? 'solid'}
                    action={async () => {
                        setLoading(true);
                        buttons.onYes && await buttons.onYes();
                        setLoading(false);
                        setIsOpen(false);
                    }}
                >
                    {buttons.yes ?? 'Ok'}
                </Button>
                <Button
                    theme={buttons.noTheme ?? 'grey'}
                    action={async () => {
                        setLoading(true);
                        buttons.onNo && await buttons.onNo();
                        setLoading(false);
                        setIsOpen(false)
                    }}
                >
                    {buttons.no ?? 'Cancel'}
                </Button>
                {loading && <LoadingSpinner colour="black" />}
            </div>
        </Modal>
    )
}