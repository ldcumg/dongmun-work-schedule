import { SelectedDays } from './constants';
import type {
  ScheduleData,
  SelectedDaysKey,
  StaffData,
  Weekday,
} from './types';

let _staffData: StaffData[] = [];
let _scheduleData: ScheduleData = {};

const _selectedDays: Record<SelectedDaysKey, Set<Weekday>> = {
  work: new Set<Weekday>(),
  laundry: new Set<Weekday>(),
};

// getter
export const getStaffData = () => _staffData;
export const getScheduleData = () => _scheduleData;

export const getSelectedDays = (key: SelectedDaysKey) => _selectedDays[key];

// setter
export const setStaffData = (staffData: StaffData[]) =>
  (_staffData = staffData);
export const setScheduleData = (scheduleData: ScheduleData) =>
  (_scheduleData = scheduleData);

export const selectDay = (key: SelectedDaysKey, day: Weekday) =>
  _selectedDays[key].add(day);
export const deselectDay = (key: SelectedDaysKey, day: Weekday) =>
  _selectedDays[key].delete(day);
export const clearSelectedDays = () => {
  for (const key in _selectedDays) {
    _selectedDays[key as SelectedDaysKey].clear();
  }
};

/** 선택된 날들을 스케줄 데이터에서 동기화 */
export const syncSelectedDays = (name: string, scheduleData: ScheduleData) => {
  if (name && scheduleData[name]) {
    const { work, laundry } = scheduleData[name];

    work && work.forEach((day) => selectDay(SelectedDays.WORK, day));
    laundry && laundry.forEach((day) => selectDay(SelectedDays.LAUNDRY, day));
  }
};
