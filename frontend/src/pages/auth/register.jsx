import { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import { useRouter } from "next/router";
import MainLayout from "../../components/Layouts/MainLayout";
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
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {(localError || authError) && (
        <div className="alert alert-error mb-4">{localError || authError}</div>
      )}
      <form onSubmit={submit} className="max-w-md mx-auto space-y-4">
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
        <button className="btn btn-primary w-full" type="submit">
          Register
        </button>
      </form>
    </MainLayout>
  );
};

export default Register;
