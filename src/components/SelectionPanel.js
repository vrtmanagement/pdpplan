export default function SelectionPanel({
  title,
  items,
  selectedItems,
  onSelect,
  maxSelections,
}) {
  const limitReached = selectedItems.length >= maxSelections;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        <span className="text-sm text-zinc-500">
          {selectedItems.length}/{maxSelections} selected
        </span>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                disabled={isSelected || limitReached}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "cursor-not-allowed border-indigo-300 bg-indigo-50 text-indigo-700"
                    : limitReached
                      ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {item}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
