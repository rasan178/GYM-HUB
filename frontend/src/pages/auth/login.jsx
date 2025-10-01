import { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import { useRouter } from "next/router";
import AuthLayout from "../../components/Layouts/AuthLayout";
import TextInput from "../../components/Inputs/TextInput";

const Login = () => {
  const { login, error: authError, user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [mounted, setMounted] = useState(false); // prevent SSR mismatch
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (user) {
      // already logged in → redirect
      if (user.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    }
  }, [user, router]);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    } catch (err) {
      setLocalError(err.message || "Login failed");
    }
  };

  if (!mounted) return null; // prevent hydration errors

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-8 shadow-2xl rounded-lg">
            {/* Header with enhanced GYM branding */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center bg-black text-white px-4 sm:px-6 py-3 sm:py-4 font-black text-xl sm:text-2xl mb-4 sm:mb-6 rounded-lg shadow-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white text-black rounded-full flex items-center justify-center mr-2 sm:mr-3 font-bold text-sm sm:text-base">
                  G
                </div>
                GYM-HUB
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black uppercase tracking-wider mb-2 sm:mb-3">
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium max-w-sm mx-auto">
                Sign in to continue your fitness transformation journey
              </p>
            </div>
          
          {(localError || authError) && (
            <div className="bg-red-50 border-2 border-red-500 text-red-800 px-4 py-3 mb-6 font-bold flex items-center gap-3">
              <div className="bg-red-500 text-white p-1 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{localError || authError}</span>
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-5 sm:space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-black px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-black/20 font-medium rounded-lg transition-all duration-300"
                  placeholder="Enter your email address"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-black px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-black/20 font-medium rounded-lg transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              className="w-full bg-black text-white py-4 sm:py-5 px-6 sm:px-8 font-black uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-2 border-black text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
              type="submit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </button>
          </form>
          
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              New to GYM-HUB?{" "}
              <a href="/auth/register" className="text-black font-black hover:underline uppercase tracking-wide">
                Create Account
              </a>
            </p>
          </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;