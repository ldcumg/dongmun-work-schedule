import type { WEEKDAYS } from './constants';

export type Weekday = (typeof WEEKDAYS)[number];

export type ScheduleData = Record<
  string,
  {
    work: Weekday[];
    laundry: Weekday[];
  }
>;

type StaffInfo = {
  name: string;
  workDays?: Record<string, number>;
};

export type StaffResponse = Record<string, StaffInfo>;

export type StaffData = {
  staffKey: string;
} & StaffInfo;

export type SelectedDays = {
  work: Set<Weekday>;
  laundry: Set<Weekday>;
};
export type SelectedDaysKey = keyof SelectedDays;
export type SelectedDaysValue = SelectedDays[SelectedDaysKey];
