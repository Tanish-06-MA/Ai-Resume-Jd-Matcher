import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { Mail, Lock, User, UserPlus, Sparkles } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

function Signup() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {

            await axiosInstance.post(
                "/auth/signup",
                {
                    name,
                    email,
                    password
                }
            );

            alert("Signup Successful");

            navigate("/");

        } catch (error) {

            console.error(error);

            setError("Signup failed. Please try again.");

        } finally {
            setLoading(false);
        }

    };

    return (

        <div className="min-h-screen animated-bg flex items-center justify-center px-4">
            {/* Background glow orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 animate-scale-in" padding="lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/25">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-gray-400 mt-2">Get started with ResuMatch</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center animate-fade-in">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSignup} className="space-y-5">
                    <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        icon={User}
                        label="Full Name"
                    />

                    <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={Mail}
                        label="Email"
                    />

                    <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={Lock}
                        label="Password"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={loading}
                        icon={UserPlus}
                    >
                        Create Account
                    </Button>
                </form>

                {/* Footer */}
                <p className="text-center text-gray-400 mt-6 text-sm">
                    Already have an account?{" "}
                    <Link to="/" className="text-accent hover:text-blue-400 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </Card>
        </div>

    );

}

export default Signup;