import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg(
          "Signup successful! Please check your email for the verification link."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-sky-50 p-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/80 shadow-xl rounded-2xl border border-sky-100 p-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-sky-700 mb-2">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-slate-500 mb-6 text-sm">
          {isSignUp
            ? "Join our platform and start auditing smartly."
            : "Login to continue managing your reports."}
        </p>

        {/* Error / Success messages */}
        {errorMsg && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded-md mb-3 text-center border border-red-200">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-100 text-green-700 text-sm p-2 rounded-md mb-3 text-center border border-green-200">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-800 placeholder:text-slate-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-800 placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 font-semibold rounded-lg transition-colors ${
              loading
                ? "bg-sky-400 cursor-not-allowed text-white"
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-3 text-slate-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Toggle Auth Mode */}
        <p className="text-center text-slate-600 text-sm">
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}
          <span
            className="text-sky-600 hover:text-sky-700 cursor-pointer ml-1 font-medium"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Login here" : "Sign up here"}
          </span>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Nexcore Alliance Audits
        </p>
      </div>
    </div>
  );
}
