import type { WEEKDAYS } from './constants';

export type Weekday = (typeof WEEKDAYS)[number];

export type SelectedDays = {
  work: Set<Weekday>;
  laundry: Set<Weekday>;
};
export type SelectedDaysKey = keyof SelectedDays;
export type SelectedDaysValue = SelectedDays[SelectedDaysKey];

export type ScheduleData = {
  [key: string]: {
    work: Weekday[];
    laundry: Weekday[];
  };
};

export type Staff = {
  name: string;
  workDays: Record<string, number>;
  docId: string;
};
