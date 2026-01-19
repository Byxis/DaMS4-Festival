import { computed, Signal } from '@angular/core';

export type SortStrategy<T> = (a: T, b: T) => number;
export type SortConfig<T> = Record<string, SortStrategy<T>>;

/**
 * Creates a computed signal that sorts a list based on an active sort key signal.
 * 
 * @param sourceSignal The signal containing the list of items to sort.
 * @param sortKeySignal The signal containing the current sort key (string).
 * @param strategies A dictionary mapping sort keys to compare functions.
 * @returns A computed signal containing the sorted list.
 */
export function computedSorted<T>(
  sourceSignal: Signal<T[]>,
  sortKeySignal: Signal<string>,
  strategies: SortConfig<T>
): Signal<T[]> {
  return computed(() => {
    const list = sourceSignal();
    const sortKey = sortKeySignal();
    const strategy = strategies[sortKey];

    if (!strategy) {
      return list;
    }

    return [...list].sort(strategy);
  });
}
