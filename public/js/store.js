const _selectedWorkDays = new Set();
const _selectedLaundryDays = new Set();

// getter
export const getSelectedWorkDays = () => _selectedWorkDays;
export const getSelectedLaundryDays = () => _selectedLaundryDays;

// setter/조작 함수
export const addWorkDay = (day) => _selectedWorkDays.add(day);
export const addLaundryDay = (day) => _selectedLaundryDays.add(day);

export const removeWorkDay = (day) => _selectedWorkDays.delete(day);
export const removeLaundryDay = (day) => _selectedLaundryDays.delete(day);

export const resetSelectedDays = () => {
  _selectedWorkDays.clear();
  _selectedLaundryDays.clear();
};
