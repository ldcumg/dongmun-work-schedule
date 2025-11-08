import type { Weekday } from './type';

const _selectedWorkDays = new Set<Weekday>();
const _selectedLaundryDays = new Set<Weekday>();

// getter
export const getSelectedWorkDays = () => _selectedWorkDays;
export const getSelectedLaundryDays = () => _selectedLaundryDays;

// setter/조작 함수
export const addWorkDay = (day: Weekday) => _selectedWorkDays.add(day);
export const addLaundryDay = (day: Weekday) => _selectedLaundryDays.add(day);

export const removeWorkDay = (day: Weekday) => _selectedWorkDays.delete(day);
export const removeLaundryDay = (day: Weekday) =>
  _selectedLaundryDays.delete(day);

export const resetSelectedDays = () => {
  _selectedWorkDays.clear();
  _selectedLaundryDays.clear();
};
