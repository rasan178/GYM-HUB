import { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import { useRouter } from "next/router";
import AuthLayout from "../../components/Layouts/AuthLayout";
import TextInput from "../../components/Inputs/TextInput";

const Register = () => {
  const { register, error: authError, user } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (user) {
      // already logged in → redirect to dashboard or admin
      if (user.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    }
  }, [user, router]);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await register(name, email, password);
      router.push("/auth/login"); // redirect to Login after registration
    } catch (err) {
      setLocalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to register. Please try again."
      );
    }
  };

  if (!mounted) return null; // prevent hydration errors

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Register</h1>
        {(localError || authError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {localError || authError}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
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
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-black">
            Already have an account?{" "}
            <a href="/auth/login" className="text-black font-medium hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;