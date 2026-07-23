import { useState, useEffect } from "react";

function ProgressBar({
    value = 0,
    label = "",
    color = "blue",
    showPercent = true,
    size = "md",
    animated = true,
    delay = 0
}) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setWidth(Math.min(value, 100));
        }, delay + 100);
        return () => clearTimeout(timer);
    }, [value, delay]);

    const colorMap = {
        blue: {
            bar: "from-blue-500 to-blue-400",
            bg: "bg-blue-500/10",
            text: "text-blue-400",
            glow: "shadow-blue-500/20"
        },
        green: {
            bar: "from-green-500 to-emerald-400",
            bg: "bg-green-500/10",
            text: "text-green-400",
            glow: "shadow-green-500/20"
        },
        purple: {
            bar: "from-purple-500 to-violet-400",
            bg: "bg-purple-500/10",
            text: "text-purple-400",
            glow: "shadow-purple-500/20"
        },
        amber: {
            bar: "from-amber-500 to-yellow-400",
            bg: "bg-amber-500/10",
            text: "text-amber-400",
            glow: "shadow-amber-500/20"
        },
        cyan: {
            bar: "from-cyan-500 to-teal-400",
            bg: "bg-cyan-500/10",
            text: "text-cyan-400",
            glow: "shadow-cyan-500/20"
        },
        rose: {
            bar: "from-rose-500 to-pink-400",
            bg: "bg-rose-500/10",
            text: "text-rose-400",
            glow: "shadow-rose-500/20"
        }
    };

    const heights = {
        sm: "h-2",
        md: "h-3",
        lg: "h-4"
    };

    const scheme = colorMap[color] || colorMap.blue;

    return (
        <div className="w-full">
            {(label || showPercent) && (
                <div className="flex justify-between items-center mb-2">
                    {label && (
                        <span className="text-sm font-medium text-gray-300">
                            {label}
                        </span>
                    )}
                    {showPercent && (
                        <span className={`text-sm font-bold ${scheme.text}`}>
                            {width.toFixed(1)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full ${scheme.bg} rounded-full ${heights[size]} overflow-hidden`}>
                <div
                    className={`${heights[size]} rounded-full bg-gradient-to-r ${scheme.bar} shadow-lg ${scheme.glow} ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

export default ProgressBar;
