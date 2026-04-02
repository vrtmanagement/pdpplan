"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserMenu({ username = "User" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (event) => {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

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
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-white"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
          {username.slice(0, 1).toUpperCase()}
        </span>
        <span>{username}</span>
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
          <button
            type="button"
            disabled={loggingOut}
            onClick={onLogout}
            className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:bg-zinc-100"
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
        </div>
      ) : null}
    </div>
  );
}

