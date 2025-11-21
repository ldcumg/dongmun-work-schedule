import type { SelectedDaysKey, Weekday } from './types';

const _selectedDays: Record<SelectedDaysKey, Set<Weekday>> = {
  work: new Set<Weekday>(),
  laundry: new Set<Weekday>(),
};

// getter
export const getSelectedDays = (key: SelectedDaysKey) => _selectedDays[key];

// setter
export const selectDay = (key: SelectedDaysKey, day: Weekday) =>
  _selectedDays[key].add(day);

export const deselectDay = (key: SelectedDaysKey, day: Weekday) =>
  _selectedDays[key].delete(day);

export const clearSelectedDays = () => {
  for (const key in _selectedDays) {
    _selectedDays[key as SelectedDaysKey].clear();
  }
};
