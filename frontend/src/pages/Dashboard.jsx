import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
    Upload, FileText, Search, Sparkles, X,
    BarChart3, Target, Shield, TrendingUp, AlertCircle
} from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
import Loader from "../components/Loader";

function Dashboard() {

    const [resume, setResume] = useState(null);

    const [jd, setJd] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch dashboard analytics on mount
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get(
                "/analysis/dashboard-stats",
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );
            setStats(response.data);
        } catch (err) {
            console.error("Failed to load stats:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setResume(file);
                setError("");
            } else {
                setError("Only PDF files are accepted.");
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/pdf") {
                setResume(file);
                setError("");
            } else {
                setError("Only PDF files are accepted.");
                setResume(null);
            }
        }
    };

    const handleAnalyze = async () => {

        if (!resume) {
            setError("Please upload a PDF resume.");
            return;
        }

        if (!jd.trim()) {
            setError("Please paste a job description.");
            return;
        }

        setError("");

        const formData = new FormData();

        formData.append("resume", resume);

        formData.append("jd", jd);

        setLoading(true);

        try {
            const response = await axiosInstance.post(
                "/analysis/analyze",
                formData,
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );

            navigate(
                "/results",
                {
                    state: response.data
                }
            );
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Analysis failed. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }

    };

    return (

        <div className="min-h-screen bg-background pt-24 pb-12 px-4">
            {loading && <Loader fullScreen text="Analyzing your resume with AI... This may take a moment." />}

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Analysis
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                        Resume & JD <span className="gradient-text">Matcher</span>
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Upload your resume and paste a job description to get an instant AI match score with missing keyword analysis.
                    </p>
                </div>

                {/* ──────── Dashboard Analytics (FEATURE 8) ──────── */}
                {!statsLoading && stats && stats.totalAnalyses > 0 && (
                    <div className="mb-8 animate-slide-up">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-accent" />
                            <h2 className="text-lg font-semibold text-white">Your Analytics</h2>
                        </div>
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                            {/* Total Analyses */}
                            <Card padding="md" className="text-center">
                                <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <BarChart3 className="w-5 h-5 text-blue-400" />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.totalAnalyses}</p>
                                <p className="text-xs text-gray-500 mt-1">Total Analyses</p>
                            </Card>

                            {/* Average Match Score */}
                            <Card padding="md" className="text-center">
                                <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Target className="w-5 h-5 text-green-400" />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.averageMatchScore}%</p>
                                <p className="text-xs text-gray-500 mt-1">Avg Match Score</p>
                            </Card>

                            {/* Highest ATS Score */}
                            <Card padding="md" className="text-center">
                                <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Shield className="w-5 h-5 text-cyan-400" />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.highestAtsScore}%</p>
                                <p className="text-xs text-gray-500 mt-1">Best ATS Score</p>
                            </Card>

                            {/* Most Missing Skill */}
                            <Card padding="md" className="text-center">
                                <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <p className="text-sm font-bold text-white truncate px-1">
                                    {stats.mostMissingSkill || "—"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Most Missing</p>
                            </Card>
                        </div>

                        {/* Recent Skills */}
                        {stats.recentSkills && stats.recentSkills.length > 0 && (
                            <div className="mt-4">
                                <Card padding="md">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        <p className="text-sm text-gray-400">Recently Added Skills</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.recentSkills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                        <button
                            onClick={() => setError("")}
                            className="ml-auto text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upload Card */}
                    <Card className="animate-slide-up" padding="lg">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                                <Upload className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Upload Resume</h2>
                                <p className="text-xs text-gray-500">PDF format only</p>
                            </div>
                        </div>

                        {/* Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`
                                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                                ${dragActive
                                    ? 'border-accent bg-accent/10'
                                    : resume
                                        ? 'border-success/40 bg-success/5'
                                        : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                                }
                            `}
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {resume ? (
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="w-10 h-10 text-success" />
                                    <p className="text-sm text-white font-medium">{resume.name}</p>
                                    <p className="text-xs text-gray-500">{(resume.size / 1024).toFixed(1)} KB</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setResume(null); }}
                                        className="mt-1 text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <X className="w-3 h-3" /> Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-10 h-10 text-gray-500" />
                                    <p className="text-sm text-gray-400">
                                        <span className="text-accent font-medium">Click to upload</span> or drag & drop
                                    </p>
                                    <p className="text-xs text-gray-600">PDF up to 10MB</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* JD Card */}
                    <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }} padding="lg">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Job Description</h2>
                                <p className="text-xs text-gray-500">Paste the full JD text</p>
                            </div>
                        </div>

                        <textarea
                            rows="10"
                            placeholder="Paste the complete job description here..."
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 resize-none text-sm leading-relaxed"
                        />

                        <div className="flex justify-end mt-2">
                            <span className="text-xs text-gray-600">{jd.length} characters</span>
                        </div>
                    </Card>
                </div>

                {/* Analyze Button */}
                <div className="mt-8 flex justify-center animate-fade-in">
                    <Button
                        onClick={handleAnalyze}
                        size="lg"
                        icon={Search}
                        disabled={!resume || !jd.trim()}
                        className="px-12"
                    >
                        Analyze Resume
                    </Button>
                </div>
            </div>
        </div>

    );

}

export default Dashboard;