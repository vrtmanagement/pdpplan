import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
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

function SortableSelectedItem({ id, index, onRemove }) {
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
    transition: transition || "transform 180ms ease, opacity 180ms ease",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 shadow-sm"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex flex-1 cursor-grab items-center gap-2 text-left active:cursor-grabbing"
      >
        <span className="text-zinc-400">⋮⋮</span>
        <span className="text-sm font-medium text-zinc-800">
          {index + 1}. {id}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
      >
        Remove
      </button>
    </li>
  );
}

export default function SelectedPanel({
  title,
  selectedItems,
  onRemove,
  onReorder,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = selectedItems.indexOf(active.id);
    const newIndex = selectedItems.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    onReorder(oldIndex, newIndex);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900">{title}</h3>
      {!selectedItems.length ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
          No items selected yet.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedItems}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {selectedItems.map((item, index) => (
                <SortableSelectedItem
                  key={item}
                  id={item}
                  index={index}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <p className="mt-3 text-xs text-zinc-500">
        Drag the handle to reorder selected items smoothly.
      </p>
    </div>
  );
}
