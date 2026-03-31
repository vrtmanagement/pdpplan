"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <main className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Login</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in to manage PDP data and generate PDFs.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-zinc-700">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-zinc-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              loading
                ? "cursor-not-allowed bg-zinc-300"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </main>
    </div>
  );
}

