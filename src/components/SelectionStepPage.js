"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/StepLayout";
import { useFormState } from "@/components/form-context";

function DroppablePanel({ id, title, countText, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-4 transition ${
        isOver
          ? "border-indigo-400 bg-indigo-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        {countText ? <span className="text-sm text-zinc-500">{countText}</span> : null}
      </div>
      {children}
    </div>
  );
}

function SortableItem({ id, index, zone, onAdd, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 180ms ease",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex flex-1 cursor-grab items-center gap-2 text-left active:cursor-grabbing"
      >
        <span className="text-zinc-400">⋮⋮</span>
        <span className="text-sm text-zinc-800">
          {zone === "selected" ? `${index + 1}. ` : ""}
          {id}
        </span>
      </button>
      {zone === "available" ? (
        <button
          type="button"
          onClick={() => onAdd(id)}
          className="rounded-md border border-indigo-200 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
        >
          Add
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Remove
        </button>
      )}
    </li>
  );
}

export default function SelectionStepPage({
  stateKey,
  title,
  subtitle,
  availableTitle,
  selectedTitle,
  items,
  maxSelections,
  backHref,
  nextHref,
  nextButtonLabel = "Next",
  bottomSlot,
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { formState, addSelection, removeSelection, reorderSelection } =
    useFormState();
  const selectedItems = formState[stateKey];
  const availableItems = useMemo(
    () => items.filter((item) => !selectedItems.includes(item)),
    [items, selectedItems]
  );
  const maxReached = selectedItems.length >= maxSelections;

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getZone = (id) => {
    if (id === "available-zone" || availableItems.includes(id)) {
      return "available";
    }
    if (id === "selected-zone" || selectedItems.includes(id)) {
      return "selected";
    }
    return null;
  };

  const onAdd = (item) => addSelection(stateKey, item, maxSelections);
  const onRemove = (item) => removeSelection(stateKey, item);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) {
      return;
    }
    const activeZone = getZone(active.id);
    const overZone = getZone(over.id);
    if (!activeZone || !overZone) {
      return;
    }

    if (activeZone === "available" && overZone === "selected") {
      onAdd(active.id);
      return;
    }

    if (activeZone === "selected" && overZone === "available") {
      onRemove(active.id);
      return;
    }

    if (activeZone === "selected" && overZone === "selected") {
      const oldIndex = selectedItems.indexOf(active.id);
      const newIndex = selectedItems.indexOf(over.id);
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        reorderSelection(stateKey, oldIndex, newIndex);
      }
    }
  };

  if (!mounted) {
    return (
      <StepLayout title={title} subtitle={subtitle}>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
          Loading...
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout title={title} subtitle={subtitle}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <DroppablePanel
            id="available-zone"
            title={availableTitle}
            countText={`${selectedItems.length}/${maxSelections} selected`}
          >
            <SortableContext
              items={availableItems}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {availableItems.map((item, index) => (
                  <SortableItem
                    key={item}
                    id={item}
                    index={index}
                    zone="available"
                    onAdd={onAdd}
                    onRemove={onRemove}
                  />
                ))}
              </ul>
            </SortableContext>
            {maxReached ? (
              <p className="mt-3 text-xs text-amber-600">
                Max limit reached. Drag items back to left to remove.
              </p>
            ) : null}
          </DroppablePanel>

          <DroppablePanel id="selected-zone" title={selectedTitle}>
            <SortableContext
              items={selectedItems}
              strategy={verticalListSortingStrategy}
            >
              {!selectedItems.length ? (
                <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
                  Drag items here to select.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedItems.map((item, index) => (
                    <SortableItem
                      key={item}
                      id={item}
                      index={index}
                      zone="selected"
                      onAdd={onAdd}
                      onRemove={onRemove}
                    />
                  ))}
                </ul>
              )}
            </SortableContext>
            <p className="mt-3 text-xs text-zinc-500">
              Drag left → right to add, right → left to remove.
            </p>
          </DroppablePanel>
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm text-zinc-900 shadow-lg">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {bottomSlot ? <div className="mt-6">{bottomSlot}</div> : null}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => router.push(nextHref)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          {nextButtonLabel}
        </button>
      </div>
    </StepLayout>
  );
}
