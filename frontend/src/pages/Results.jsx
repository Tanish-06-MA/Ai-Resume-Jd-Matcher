import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    Target, AlertTriangle, ArrowLeft, RotateCcw,
    Download, Brain, BookOpen, MessageSquare,
    Shield, CheckCircle, XCircle, TrendingUp,
    Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import { generatePDFReport } from "../utils/generatePDF";

function Results() {

    const location = useLocation();
    const navigate = useNavigate();
    const [animatedScore, setAnimatedScore] = useState(0);
    const [expandedSections, setExpandedSections] = useState({});

    if (!location.state) {

        return (

            <div className="min-h-screen bg-background pt-24 flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center animate-fade-in" padding="lg">
                    <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No Analysis Data Found</h2>
                    <p className="text-gray-400 mb-6">Please analyze a resume first.</p>
                    <Button onClick={() => navigate("/dashboard")} icon={ArrowLeft}>
                        Go to Dashboard
                    </Button>
                </Card>
            </div>

        );

    }

    const data = location.state;

    const matchScore = data.matchScore ?? data.score ?? 0;
    const skillMatchPercent = data.skillMatchPercent ?? 0;
    const overallScore = data.overallScore ?? matchScore ?? 0;
    const resumeSkills = data.resumeSkills ?? [];
    const jdSkills = data.jdSkills ?? [];
    const matchedSkills = data.matchedSkills ?? [];
    const missingSkills = data.missingSkills ?? data.missingKeywords ?? [];
    const strengths = data.strengths ?? [];
    const weaknesses = data.weaknesses ?? [];
    const suggestions = data.suggestions ?? [];
    const overallFeedback = data.overallFeedback ?? "";
    const atsScore = data.atsScore ?? 0;
    const atsAnalysis = data.atsAnalysis ?? null;
    const interviewQuestions = data.interviewQuestions ?? [];
    const learningRoadmap = data.learningRoadmap ?? null;

    const score = parseFloat(overallScore || matchScore || 0);
    const semanticScore = parseFloat(matchScore || 0);
    const skillPercent = parseFloat(skillMatchPercent || 0);
    const atsScoreVal = parseFloat(atsScore || 0);

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Animate score counter
    useEffect(() => {
        let start = 0;
        const end = score;
        const duration = 1500;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = end / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setAnimatedScore(end);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.round(start * 10) / 10);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [score]);

    // SVG circle
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    const getScoreColor = (s) => {
        if (s >= 70) return { text: 'text-success', stroke: '#22C55E', bg: 'bg-success/10', label: 'Excellent Match' };
        if (s >= 40) return { text: 'text-warning', stroke: '#F59E0B', bg: 'bg-warning/10', label: 'Good Match' };
        return { text: 'text-danger', stroke: '#EF4444', bg: 'bg-danger/10', label: 'Needs Improvement' };
    };

    const scoreStyle = getScoreColor(score);

    const handleDownloadPDF = () => {
        generatePDFReport(location.state);
    };

    // Collapsible section component
    const CollapsibleSection = ({ title, icon: Icon, sectionKey, children, defaultOpen = true }) => {
        const isOpen = expandedSections[sectionKey] !== undefined ? expandedSections[sectionKey] : defaultOpen;
        return (
            <Card className="mb-6 animate-slide-up" padding="none">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full flex items-center justify-between p-6 cursor-pointer group"
                >
                    <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                        {Icon && <Icon className="w-5 h-5 text-accent" />}
                        {title}
                    </h3>
                    {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    )}
                </button>
                {isOpen && (
                    <div className="px-6 pb-6 animate-fade-in">
                        {children}
                    </div>
                )}
            </Card>
        );
    };

    return (

        <div className="min-h-screen bg-background pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-3xl font-bold text-white mb-2">Analysis Results</h1>
                    <p className="text-gray-400">Here&apos;s how your resume matches the job description</p>
                </div>

                {/* ──────── Score Card with Progress Bars (FEATURE 3) ──────── */}
                <Card className="text-center mb-6 animate-scale-in" padding="lg">
                    <div className="flex flex-col items-center">
                        {/* Circular Progress */}
                        <div className="relative w-48 h-48 mb-6">
                            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
                                <circle
                                    cx="100" cy="100" r={radius}
                                    fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"
                                />
                                <circle
                                    cx="100" cy="100" r={radius}
                                    fill="none" stroke={scoreStyle.stroke} strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    className="score-circle"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${scoreStyle.text}`}>
                                    {animatedScore.toFixed(1)}%
                                </span>
                                <span className="text-xs text-gray-500 mt-1">Overall Score</span>
                            </div>
                        </div>

                        {/* Label */}
                        <span className={`inline-flex items-center gap-2 px-4 py-2 ${scoreStyle.bg} rounded-full text-sm font-medium ${scoreStyle.text} mb-8`}>
                            <Target className="w-4 h-4" />
                            {scoreStyle.label}
                        </span>

                        {/* Score Breakdown Progress Bars */}
                        <div className="w-full max-w-lg space-y-5">
                            <ProgressBar
                                label="Semantic Score"
                                value={semanticScore}
                                color="blue"
                                size="md"
                                delay={200}
                            />
                            <ProgressBar
                                label="Skill Match"
                                value={skillPercent}
                                color="purple"
                                size="md"
                                delay={400}
                            />
                            <ProgressBar
                                label="Overall Match"
                                value={score}
                                color="green"
                                size="md"
                                delay={600}
                            />
                        </div>
                    </div>
                </Card>

                {/* ──────── Overall AI Feedback (FEATURE 1) ──────── */}
                {overallFeedback && (
                    <CollapsibleSection title="Overall AI Feedback" icon={Sparkles} sectionKey="feedback">
                        <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 rounded-xl p-5">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {overallFeedback}
                            </p>
                        </div>
                    </CollapsibleSection>
                )}

                {/* ──────── Matched Skills (FEATURE 2) ──────── */}
                <CollapsibleSection title="Skills Analysis" icon={CheckCircle} sectionKey="skills">
                    {/* Resume Skills */}
                    <div className="mb-6">
                        <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full" />
                            Resume Skills ({resumeSkills?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {resumeSkills?.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* JD Skills */}
                    <div className="mb-6">
                        <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full" />
                            JD Required Skills ({jdSkills?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {jdSkills?.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Matched Skills */}
                    <div className="mb-6">
                        <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            Matched Skills ({matchedSkills?.length || 0})
                        </p>
                        {matchedSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {matchedSkills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-lg text-sm font-medium flex items-center gap-1.5"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No directly matching skills found.</p>
                        )}
                    </div>

                    {/* Missing Skills */}
                    <div>
                        <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-400" />
                            Missing Skills ({missingSkills?.length || 0})
                        </p>
                        {missingSkills?.length === 0 ? (
                            <p className="text-green-400 text-sm">
                                🎉 Excellent! No missing technical skills found.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {missingSkills?.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium flex items-center gap-1.5"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* ──────── ATS Compatibility (FEATURE 4) ──────── */}
                {(atsScore > 0 || atsAnalysis) && (
                    <CollapsibleSection title="ATS Compatibility (AI Estimate)" icon={Shield} sectionKey="ats">
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 mb-5">
                            <p className="text-amber-400 text-xs flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                This is an AI-generated estimate, not an official ATS algorithm result.
                            </p>
                        </div>

                        <div className="mb-6">
                            <ProgressBar
                                label="ATS Compatibility Score"
                                value={atsScoreVal}
                                color="cyan"
                                size="lg"
                                delay={800}
                            />
                        </div>

                        {atsAnalysis && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {atsAnalysis.formattingFeedback && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Formatting</p>
                                        <p className="text-sm text-gray-300">{atsAnalysis.formattingFeedback}</p>
                                    </div>
                                )}
                                {atsAnalysis.keywordCoverage && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Keyword Coverage</p>
                                        <p className="text-sm text-gray-300">{atsAnalysis.keywordCoverage}</p>
                                    </div>
                                )}
                                {atsAnalysis.experienceQuality && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Experience Quality</p>
                                        <p className="text-sm text-gray-300">{atsAnalysis.experienceQuality}</p>
                                    </div>
                                )}
                                {atsAnalysis.projectQuality && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Project Quality</p>
                                        <p className="text-sm text-gray-300">{atsAnalysis.projectQuality}</p>
                                    </div>
                                )}
                                {atsAnalysis.missingAreas?.length > 0 && (
                                    <div className="sm:col-span-2 bg-red-500/5 rounded-xl p-4 border border-red-500/10">
                                        <p className="text-xs text-red-400 mb-3 uppercase tracking-wider font-medium">Important Missing Areas</p>
                                        <div className="flex flex-wrap gap-2">
                                            {atsAnalysis.missingAreas.map((area, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CollapsibleSection>
                )}

                {/* ──────── Strengths ──────── */}
                <CollapsibleSection title="Strengths" icon={TrendingUp} sectionKey="strengths">
                    {strengths && strengths.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {strengths.map((item, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">No strengths identified.</p>
                    )}
                </CollapsibleSection>

                {/* ──────── Weaknesses ──────── */}
                <CollapsibleSection title="Weaknesses" icon={AlertTriangle} sectionKey="weaknesses">
                    {weaknesses && weaknesses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {weaknesses.map((item, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-sm font-medium"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">No weaknesses identified.</p>
                    )}
                </CollapsibleSection>

                {/* ──────── AI Suggestions ──────── */}
                <CollapsibleSection title="AI Suggestions" icon={Brain} sectionKey="suggestions">
                    {suggestions && suggestions.length > 0 ? (
                        <ol className="space-y-3">
                            {suggestions.map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3 text-sm text-gray-300"
                                >
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/20">
                                        {index + 1}
                                    </span>
                                    <span className="pt-0.5">{item}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-gray-400 text-sm">No suggestions available.</p>
                    )}
                </CollapsibleSection>

                {/* ──────── Interview Questions (FEATURE 5) ──────── */}
                {interviewQuestions && interviewQuestions.length > 0 && (
                    <CollapsibleSection title="Interview Questions" icon={MessageSquare} sectionKey="interview" defaultOpen={false}>
                        <div className="space-y-4">
                            {interviewQuestions.map((q, index) => (
                                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-500/15 text-purple-400 text-sm font-bold border border-purple-500/20">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-medium mb-2">{q.question}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-xs font-medium">
                                                    {q.type || "General"}
                                                </span>
                                                {q.skill && (
                                                    <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded-md text-xs">
                                                        {q.skill}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>
                )}

                {/* ──────── Learning Roadmap (FEATURE 6) ──────── */}
                {learningRoadmap && (learningRoadmap.highPriority?.length > 0 || learningRoadmap.mediumPriority?.length > 0 || learningRoadmap.lowPriority?.length > 0) && (
                    <CollapsibleSection title="Learning Roadmap" icon={BookOpen} sectionKey="roadmap" defaultOpen={false}>
                        {/* High Priority */}
                        {learningRoadmap.highPriority?.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                    High Priority
                                </p>
                                <div className="space-y-3">
                                    {learningRoadmap.highPriority.map((item, i) => (
                                        <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                                            <p className="text-sm text-white font-medium mb-1">{item.skill}</p>
                                            <p className="text-xs text-gray-400">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Medium Priority */}
                        {learningRoadmap.mediumPriority?.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-amber-500 rounded-full" />
                                    Medium Priority
                                </p>
                                <div className="space-y-3">
                                    {learningRoadmap.mediumPriority.map((item, i) => (
                                        <div key={i} className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                                            <p className="text-sm text-white font-medium mb-1">{item.skill}</p>
                                            <p className="text-xs text-gray-400">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Low Priority */}
                        {learningRoadmap.lowPriority?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full" />
                                    Low Priority
                                </p>
                                <div className="space-y-3">
                                    {learningRoadmap.lowPriority.map((item, i) => (
                                        <div key={i} className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                                            <p className="text-sm text-white font-medium mb-1">{item.skill}</p>
                                            <p className="text-xs text-gray-400">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CollapsibleSection>
                )}

                {/* ──────── Actions ──────── */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
                    <Button onClick={handleDownloadPDF} icon={Download} variant="secondary">
                        Download PDF Report
                    </Button>
                    <Button onClick={() => navigate("/dashboard")} icon={RotateCcw}>
                        Analyze Another Resume
                    </Button>
                    <Button onClick={() => navigate("/history")} variant="secondary">
                        View History
                    </Button>
                </div>
            </div>
        </div>

    );

}

export default Results;