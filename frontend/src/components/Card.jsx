function Card({
    children,
    className = '',
    hover = false,
    padding = 'md',
}) {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`
                bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl
                ${hover ? 'transition-all duration-300 hover:bg-card hover:border-white/20 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1' : ''}
                ${paddings[padding]}
                ${className}
            `}
        >
            {children}
        </div>
    );
}

export default Card;
