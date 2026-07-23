import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Clock, Target, AlertTriangle, Search, Inbox, Eye } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";

function History() {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {

        fetchHistory();

    }, []);

    const fetchHistory = async () => {

        try {

            const response = await axiosInstance.get(
                "/analysis/history",
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );

            setHistory(response.data);

        } catch (error) {

            console.error(error);

        } finally {
            setLoading(false);
        }

    };

    const getScoreColor = (s) => {
        if (s >= 70) return 'text-success bg-success/15 border-success/20';
        if (s >= 40) return 'text-warning bg-warning/15 border-warning/20';
        return 'text-danger bg-danger/15 border-danger/20';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }) + ' at ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const navigateToReport = (item) => {
        navigate("/results", {
            state: {
                matchScore: item.score ?? 0,
                skillMatchPercent: item.skillMatchPercent ?? 0,
                overallScore: item.overallScore ?? item.score ?? 0,
                resumeSkills: item.resumeSkills ?? [],
                jdSkills: item.jdSkills ?? [],
                matchedSkills: item.matchedSkills ?? [],
                missingSkills: item.missingSkills ?? item.missingKeywords ?? [],
                strengths: item.strengths ?? [],
                weaknesses: item.weaknesses ?? [],
                suggestions: item.suggestions ?? [],
                overallFeedback: item.overallFeedback ?? "",
                atsScore: item.atsScore ?? 0,
                atsAnalysis: item.atsAnalysis ?? null,
                interviewQuestions: item.interviewQuestions ?? [],
                learningRoadmap: item.learningRoadmap ?? null
            }
        });
    };

    return (

        <div className="min-h-screen bg-background pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Analysis <span className="gradient-text">History</span>
                    </h1>
                    <p className="text-gray-400">Track all your past resume analyses</p>
                </div>

                {loading ? (
                    <Loader text="Loading history..." />
                ) : history.length === 0 ? (
                    /* Empty State */
                    <Card className="text-center animate-fade-in" padding="lg">
                        <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No Analyses Yet</h2>
                        <p className="text-gray-400 mb-6">Start by analyzing your first resume.</p>
                        <Button onClick={() => navigate("/dashboard")} icon={Search}>
                            Analyze a Resume
                        </Button>
                    </Card>
                ) : (
                    /* History Grid */
                    <div className="grid gap-4 sm:grid-cols-2">
                        {history.map((item, index) => (

                            <Card
                                key={item._id}
                                hover
                                padding="md"
                                className="animate-slide-up"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                {/* Top Row — Score + Date */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-bold rounded-lg border ${getScoreColor(item.score)}`}>
                                        <Target className="w-3.5 h-3.5" />
                                        {item.score}%
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatDate(item.createdAt)}
                                    </span>
                                </div>

                                {/* Resume Skills */}
                                {item.resumeSkills && item.resumeSkills.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-400 mb-2">✅ Resume Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.resumeSkills.slice(0, 6).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md text-xs"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {item.resumeSkills.length > 6 && (
                                                <span className="px-2 py-0.5 bg-white/5 text-gray-500 rounded-md text-xs">
                                                    +{item.resumeSkills.length - 6} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Missing Skills */}
                                <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Missing Skills
                                    </p>
                                    {(item.missingSkills && item.missingSkills.length > 0) ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.missingSkills.slice(0, 6).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-xs"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {item.missingSkills.length > 6 && (
                                                <span className="px-2 py-0.5 bg-white/5 text-gray-500 rounded-md text-xs">
                                                    +{item.missingSkills.length - 6} more
                                                </span>
                                            )}
                                        </div>
                                    ) : (item.missingKeywords && item.missingKeywords.length > 0) ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.missingKeywords.slice(0, 6).map((kw, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-xs"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                            {item.missingKeywords.length > 6 && (
                                                <span className="px-2 py-0.5 bg-white/5 text-gray-500 rounded-md text-xs">
                                                    +{item.missingKeywords.length - 6} more
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-success">✓ All skills matched</p>
                                    )}
                                </div>

                                {/* Strengths */}
                                {item.strengths && item.strengths.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-400 mb-2">💪 Strengths</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.strengths.slice(0, 4).map((s, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md text-xs"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                            {item.strengths.length > 4 && (
                                                <span className="px-2 py-0.5 bg-white/5 text-gray-500 rounded-md text-xs">
                                                    +{item.strengths.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Weaknesses */}
                                {item.weaknesses && item.weaknesses.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-400 mb-2">⚠ Weaknesses</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.weaknesses.slice(0, 4).map((w, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md text-xs"
                                                >
                                                    {w}
                                                </span>
                                            ))}
                                            {item.weaknesses.length > 4 && (
                                                <span className="px-2 py-0.5 bg-white/5 text-gray-500 rounded-md text-xs">
                                                    +{item.weaknesses.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* AI Suggestions */}
                                {item.suggestions && item.suggestions.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-2">🤖 AI Suggestions</p>
                                        <ol className="space-y-1.5">
                                            {item.suggestions.slice(0, 3).map((sug, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-2 text-xs text-gray-300"
                                                >
                                                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/20 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <span>{sug}</span>
                                                </li>
                                            ))}
                                            {item.suggestions.length > 3 && (
                                                <li className="text-xs text-gray-500 pl-6">
                                                    +{item.suggestions.length - 3} more suggestions
                                                </li>
                                            )}
                                        </ol>
                                    </div>
                                )}

                                {/* View Full Report Button */}
                                <div className="mt-4 pt-3 border-t border-white/5">
                                    <button
                                        onClick={() => navigateToReport(item)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/30 text-accent rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer group"
                                    >
                                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        View Full Report
                                    </button>
                                </div>
                            </Card>

                        ))}
                    </div>
                )}
            </div>
        </div>

    );

}

export default History;