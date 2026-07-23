function Input({
    type = 'text',
    placeholder,
    value,
    onChange,
    icon: Icon,
    label,
    id,
    className = ''
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon className="w-5 h-5 text-gray-500" />
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`
                        w-full bg-white/5 border border-white/10 rounded-xl
                        px-4 py-3 text-white placeholder-gray-500
                        focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
                        transition-all duration-300
                        ${Icon ? 'pl-12' : ''}
                    `}
                />
            </div>
        </div>
    );
}

export default Input;
