function Loader({ fullScreen = false, text = 'Loading...' }) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-white/10 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-400 font-medium">{text}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-3 py-8">
            <div className="relative">
                <div className="w-8 h-8 border-3 border-white/10 rounded-full" />
                <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-t-accent rounded-full animate-spin" />
            </div>
            <p className="text-gray-400">{text}</p>
        </div>
    );
}

export default Loader;
