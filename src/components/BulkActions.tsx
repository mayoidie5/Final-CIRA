import React, { useState } from 'react';
import { CheckSquare, Square, Trash2, Archive, User, X } from 'lucide-react';

export interface BulkAction {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick: (selectedIds: string[]) => void;
  variant?: 'default' | 'danger';
  requiresConfirmation?: boolean;
}

interface BulkActionsProps<T extends { id: string }> {
  items: T[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  actions: BulkAction[];
  renderItem: (item: T, isSelected: boolean, onToggle: () => void) => React.ReactNode;
}

export function BulkActions<T extends { id: string }>({
  items,
  selectedIds,
  onSelectionChange,
  actions,
  renderItem
}: BulkActionsProps<T>) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleAction = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action);
    } else {
      action.onClick(selectedIds);
      onSelectionChange([]);
    }
  };

  const confirmAndExecute = () => {
    if (confirmAction) {
      confirmAction.onClick(selectedIds);
      onSelectionChange([]);
      setConfirmAction(null);
    }
  };

  return (
    <>
      {/* Selection Header */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAll}
                className="text-blue-600 dark:text-blue-400"
              >
                {allSelected ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              <span className="text-blue-800 dark:text-blue-300">
                {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleAction(action)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      action.variant === 'danger'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {action.label}
                  </button>
                );
              })}
              <button
                onClick={() => onSelectionChange([])}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All Button */}
      {selectedIds.length === 0 && items.length > 0 && (
        <div className="mb-4">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Square size={18} />
            Select All
          </button>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.map(item => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div key={item.id} className="flex items-start gap-3">
              <button
                onClick={() => toggleItem(item.id)}
                className="mt-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              <div className="flex-1">
                {renderItem(item, isSelected, () => toggleItem(item.id))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-gray-800 dark:text-white mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {confirmAction.label.toLowerCase()} {selectedIds.length}{' '}
              {selectedIds.length === 1 ? 'item' : 'items'}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndExecute}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  confirmAction.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
