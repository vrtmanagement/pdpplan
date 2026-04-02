"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loggingOut}
      onClick={onLogout}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 disabled:bg-zinc-100"
    >
      {loggingOut ? (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          Logging out...
        </>
      ) : (
        "Logout"
      )}
    </button>
  );
}

