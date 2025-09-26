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
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Login</h1>
        {(localError || authError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {localError || authError}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors" 
            type="submit"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-black">
            Don't have an account?{" "}
            <a href="/auth/register" className="text-black font-medium hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;