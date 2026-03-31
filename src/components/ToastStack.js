"use client";

function ToastIcon({ type }) {
  if (type === "success") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        ✓
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-700">
      !
    </span>
  );
}

export default function ToastStack({ toasts = [] }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-white text-emerald-900"
              : "border-red-200 bg-white text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <ToastIcon type={toast.type} />
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

