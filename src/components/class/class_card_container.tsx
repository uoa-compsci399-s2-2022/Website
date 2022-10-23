interface ClassCardProps {
    children: React.ReactNode;
    cols?: string;
}

const ClassCardContainer: React.FC<ClassCardProps> = ({ children, cols }) => {
    return (
        <div className={`grid ${cols} gap-4 p-4`}>
            {children}
        </div>
    )
}

export default ClassCardContainer;