"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import { useFormState } from "@/components/form-context";
import {
  ELEMENT_GROUP_META,
  buildExplanationDraft,
  draftToSavedExplanation,
  findGroupKeyForItem,
  flattenAllElementNames,
  getResolvedElementExplanation,
} from "@/lib/element-editor-utils";
import ToastStack from "@/components/ToastStack";
import ElementsPageSkeleton from "@/components/ElementsPageSkeleton";

function FieldCard({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm ${className}`}
    >
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function ElementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const raw = params?.item;
  const item =
    typeof raw === "string" ? decodeURIComponent(raw) : "";

  const { formState, hydrated, saveElementExplanation, deleteElement } =
    useFormState();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const pushToast = (type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  };

  const validItems = useMemo(
    () => new Set(flattenAllElementNames(formState.elementItems)),
    [formState.elementItems]
  );

  const isValid = item && validItems.has(item);

  const groupKey = useMemo(
    () => (isValid ? findGroupKeyForItem(item, formState.elementItems) : null),
    [formState.elementItems, isValid, item]
  );

  const groupMeta = useMemo(
    () => ELEMENT_GROUP_META.find((g) => g.key === groupKey),
    [groupKey]
  );

  const resolved = useMemo(
    () => (isValid ? getResolvedElementExplanation(item, formState) : null),
    [formState, isValid, item]
  );

  useEffect(() => {
    if (resolved) {
      setDraft(buildExplanationDraft(resolved));
    }
  }, [resolved]);

  useEffect(() => {
    setIsEditing(false);
    setJustSaved(false);
  }, [item]);

  const effortPreview = resolved?.effortLevels || [];

  if (!hydrated) {
    return <ElementsPageSkeleton detail />;
  }

  if (!item || !isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ProgressHeader />
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-zinc-600">Element not found.</p>
            <Link
              href="/form/elements"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startEdit = () => {
    setJustSaved(false);
    setDraft(buildExplanationDraft(resolved));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(buildExplanationDraft(resolved));
    setIsEditing(false);
  };

  const save = async () => {
    if (!draft) {
      return;
    }
    try {
      setSaving(true);
      await saveElementExplanation(item, draftToSavedExplanation(draft, resolved));
      setIsEditing(false);
      setJustSaved(true);
      pushToast("success", "Element saved successfully");
    } catch {
      pushToast("error", "Failed to save element");
    } finally {
      setSaving(false);
    }
  };

  const current = draft || buildExplanationDraft(resolved);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-indigo-50/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <ProgressHeader />

        <div className="relative mb-6 overflow-hidden rounded-3xl border border-zinc-200/70 bg-gradient-to-br from-white via-white to-indigo-50/50 p-[1px] shadow-xl shadow-zinc-200/50">
          <div className="rounded-[1.4rem] bg-white/95 px-6 py-8 backdrop-blur-md sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link
                  href="/form/elements"
                  className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
                >
                  <span aria-hidden>←</span> Library
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {groupMeta ? (
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${groupMeta.chipClass}`}
                    >
                      {groupMeta.label}
                    </span>
                  ) : null}
                  {resolved?.sourceFile ? (
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                      {resolved.sourceFile}
                    </span>
                  ) : null}
                  {justSaved ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                      Saved
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                  {item}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 antialiased">
                  Workbook sections below mirror what appears in your PDF element
                  pages. Edit content when you need a custom version for this
                  respondent library.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={startEdit}
                      className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-900/15 transition hover:bg-indigo-600"
                    >
                      Edit content
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/form/step4")}
                      className="text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline"
                    >
                      Go to report step
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="text-xs font-medium text-red-600 underline-offset-4 hover:text-red-500 hover:underline"
                    >
                      Delete element
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row-reverse">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={save}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:bg-zinc-300"
                    >
                      {saving ? (
                        <>
                          <span className="btn-spinner" aria-hidden="true" />
                          Saving...
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 pb-16">
          <FieldCard title="Definition">
            {isEditing ? (
              <textarea
                rows={6}
                value={current.definition}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...(prev || buildExplanationDraft(resolved)),
                    definition: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none ring-indigo-500/20 focus:ring-4"
              />
            ) : (
              <p className="text-sm leading-relaxed text-zinc-700 antialiased">
                {resolved.definition || (
                  <span className="text-zinc-400">No definition.</span>
                )}
              </p>
            )}
          </FieldCard>

          <FieldCard title="Instruction / Action Statement">
            {isEditing ? (
              <textarea
                rows={6}
                value={current.instruction}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...(prev || buildExplanationDraft(resolved)),
                    instruction: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none ring-indigo-500/20 focus:ring-4"
              />
            ) : (
              <p className="text-sm leading-relaxed text-zinc-700 antialiased">
                {resolved.instruction || (
                  <span className="text-zinc-400">No instruction.</span>
                )}
              </p>
            )}
          </FieldCard>

          <FieldCard title="Effort levels">
            {isEditing ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">
                  One per line: <code className="rounded bg-zinc-100 px-1">Level::Detail text</code>
                </p>
                <textarea
                  rows={8}
                  value={current.effortLevels}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...(prev || buildExplanationDraft(resolved)),
                      effortLevels: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-xs leading-relaxed text-zinc-800 outline-none ring-indigo-500/20 focus:ring-4"
                />
              </div>
            ) : (
              <ul className="space-y-3">
                {effortPreview.length ? (
                  effortPreview.map((entry, i) => (
                    <li
                      key={`${entry.level}-${i}`}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-zinc-900">
                        {entry.level}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                        {entry.detail}
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">None.</p>
                )}
              </ul>
            )}
          </FieldCard>

          <FieldCard title="Behavioral indicators">
            {isEditing ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">One line per indicator</p>
                <textarea
                  rows={10}
                  value={current.behavioralIndicators}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...(prev || buildExplanationDraft(resolved)),
                      behavioralIndicators: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none ring-indigo-500/20 focus:ring-4"
                />
              </div>
            ) : (
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 marker:text-indigo-400">
                {(resolved.behavioralIndicators || []).length ? (
                  resolved.behavioralIndicators.map((line, i) => (
                    <li key={i} className="pl-1 antialiased">
                      {line}
                    </li>
                  ))
                ) : (
                  <li className="list-none pl-0 text-zinc-400">None.</li>
                )}
              </ol>
            )}
          </FieldCard>

          <FieldCard title="Development strategies">
            {isEditing ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">One line per strategy</p>
                <textarea
                  rows={10}
                  value={current.developmentStrategies}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...(prev || buildExplanationDraft(resolved)),
                      developmentStrategies: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none ring-indigo-500/20 focus:ring-4"
                />
              </div>
            ) : (
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 marker:text-indigo-400">
                {(resolved.developmentStrategies || []).length ? (
                  resolved.developmentStrategies.map((line, i) => (
                    <li key={i} className="pl-1 antialiased">
                      {line}
                    </li>
                  ))
                ) : (
                  <li className="list-none pl-0 text-zinc-400">None.</li>
                )}
              </ol>
            )}
          </FieldCard>

          <FieldCard title="Reflection questions">
            {isEditing ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">One line per question</p>
                <textarea
                  rows={6}
                  value={current.reflectionQuestions}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...(prev || buildExplanationDraft(resolved)),
                      reflectionQuestions: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none ring-indigo-500/20 focus:ring-4"
                />
              </div>
            ) : (
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 marker:text-indigo-400">
                {(resolved.reflectionQuestions || []).length ? (
                  resolved.reflectionQuestions.map((line, i) => (
                    <li key={i} className="pl-1 antialiased">
                      {line}
                    </li>
                  ))
                ) : (
                  <li className="list-none pl-0 text-zinc-400">None.</li>
                )}
              </ol>
            )}
          </FieldCard>

        </div>
      </div>
      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900">
              Delete this element?
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Are you sure you want to delete <span className="font-medium">{item}</span>?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                No
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  try {
                    setDeleting(true);
                    await deleteElement(item);
                    pushToast("success", "Element deleted successfully");
                    setShowDeleteModal(false);
                    router.push("/form/elements");
                  } catch {
                    pushToast("error", "Failed to delete element");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  deleting
                    ? "cursor-not-allowed bg-zinc-300"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {deleting ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Deleting...
                  </>
                ) : (
                  "Yes"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <ToastStack toasts={toasts} />
    </div>
  );
}
