"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<string | null>(null); // Inline message
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      if (res.data.session) router.push("/dashboard");
    });
  }, []);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }
    setMessageType("success");
    setMessage("Login successful!");
    setTimeout(() => router.push("/dashboard"), 1000);
  };

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }
    setMessageType("success");
    setMessage("Signup successful! Check your email.");
    setIsLogin(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isLogin ? handleLogin() : handleSignup();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">{isLogin ? "Login" : "Sign Up"}</h1>

        {/* Inline Notification */}
        {message && (
          <div
            className={`mb-4 p-2 rounded text-center ${
              messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null); // clear message when switching
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
