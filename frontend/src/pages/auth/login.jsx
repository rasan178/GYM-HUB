import { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import { useRouter } from "next/router";
import MainLayout from "../../components/Layouts/MainLayout";
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
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {(localError || authError) && (
        <div className="alert alert-error mb-4">{localError || authError}</div>
      )}
      <form onSubmit={submit} className="max-w-md mx-auto space-y-4">
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
        <button className="btn btn-primary w-full" type="submit">
          Login
        </button>
      </form>
    </MainLayout>
  );
};

export default Login;
