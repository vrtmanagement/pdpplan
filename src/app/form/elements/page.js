"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import { useFormState } from "@/components/form-context";
import {
  ELEMENT_GROUP_META,
  elementDetailHref,
} from "@/lib/element-editor-utils";
import ToastStack from "@/components/ToastStack";
import ElementsPageSkeleton from "@/components/ElementsPageSkeleton";

export default function ElementsIndexPage() {
  const router = useRouter();
  const { formState, hydrated, addElement, persistError } = useFormState();
  const [query, setQuery] = useState("");
  const [newNames, setNewNames] = useState({});
  const [addingKey, setAddingKey] = useState("");
  const [toasts, setToasts] = useState([]);

  const pushToast = (type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  };

  const sections = useMemo(() => {
    return ELEMENT_GROUP_META.map((meta) => {
      const items = formState.elementItems[meta.key] || [];
      const filtered = query.trim()
        ? items.filter((name) =>
            name.toLowerCase().includes(query.trim().toLowerCase())
          )
        : items;
      return { ...meta, items, filtered };
    });
  }, [formState.elementItems, query]);

  const totalCount = useMemo(
    () =>
      ELEMENT_GROUP_META.reduce(
        (n, g) => n + (formState.elementItems[g.key] || []).length,
        0
      ),
    [formState.elementItems]
  );

  if (!hydrated) {
    return <ElementsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <ProgressHeader />
        <section className="rounded-2xl border border-zinc-200/70 bg-white/85 p-6 shadow-lg shadow-zinc-200/40 backdrop-blur-md sm:p-8">
          <div className="mb-8 flex flex-col gap-2 border-b border-zinc-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Element library
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-600">
                {totalCount} elements — choose one to open its full workbook
                content (same structure as your PDF). Edit and save on the detail
                page.
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400/90">
              PDP · Content
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative w-full max-w-md">
              <label htmlFor="element-search" className="sr-only">
                Search elements
              </label>
              <input
                id="element-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name…"
                className="w-full rounded-xl border border-zinc-200/80 bg-white/90 px-4 py-3 pl-11 text-sm shadow-sm outline-none ring-indigo-200/40 transition placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.key} className="space-y-4">
                <div
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${section.accentClass} p-[1px] shadow-sm`}
                >
                  <div className="rounded-2xl bg-white/95 px-5 py-4 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${section.chipClass}`}
                      >
                        {section.label}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {section.blurb} · {section.items.length} items
                      </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newNames[section.key] || ""}
                          onChange={(e) =>
                            setNewNames((prev) => ({
                              ...prev,
                              [section.key]: e.target.value,
                            }))
                          }
                          placeholder="New element"
                          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none ring-indigo-200 focus:ring"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const name = (newNames[section.key] || "").trim();
                            if (!name) return;
                            try {
                              setAddingKey(section.key);
                              await addElement(section.key, name, "");
                              setNewNames((prev) => ({ ...prev, [section.key]: "" }));
                              pushToast("success", "Element added successfully");
                            } catch {
                              pushToast("error", "Failed to add element");
                            } finally {
                              setAddingKey("");
                            }
                          }}
                          disabled={addingKey === section.key}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
                        >
                          {addingKey === section.key ? (
                            <>
                              <span className="btn-spinner" aria-hidden="true" />
                              Adding...
                            </>
                          ) : (
                            "Add"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.filtered.map((item) => {
                    const sectionStart = ELEMENT_GROUP_META.slice(
                      0,
                      ELEMENT_GROUP_META.findIndex((m) => m.key === section.key)
                    ).reduce(
                      (acc, g) => acc + (formState.elementItems[g.key] || []).length,
                      0
                    );
                    const idxInSection = section.items.indexOf(item);
                    const globalIndex = sectionStart + idxInSection + 1;
                    return (
                      <Link
                        key={item}
                        href={elementDetailHref(item)}
                        className="group relative flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-200/90 hover:shadow-md hover:shadow-indigo-500/10"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white tabular-nums shadow-inner group-hover:bg-indigo-600">
                          {globalIndex}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900 group-hover:text-indigo-950">
                            {item}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            Open detail · PDF-aligned content
                          </p>
                        </div>
                        <span className="text-zinc-300 transition group-hover:text-indigo-400">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {section.filtered.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500">
                    No matches in {section.label}.
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200/80 pt-8">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              Back to home
            </button>
            <p className="text-xs text-zinc-500">
              Saved edits apply to generated PDFs for this browser.
            </p>
          </div>
          {persistError ? (
            <p className="mt-3 text-xs text-red-600">{persistError}</p>
          ) : null}
        </section>
      </div>
      <ToastStack toasts={toasts} />
    </div>
  );
}
