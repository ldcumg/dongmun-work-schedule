import { SelectedDaysKey } from '../constants';
import { selectDay } from '../store';
import type { ScheduleData } from '../types';

/** 선택된 날들을 스케줄 데이터에서 동기화 */
export const syncSelectedDays = (
  savedName: string,
  scheduleData: ScheduleData
) => {
  if (savedName && scheduleData?.[savedName]) {
    const { work, laundry } = scheduleData[savedName];

    work && work.forEach((day) => selectDay(SelectedDaysKey.WORK, day));
    laundry &&
      laundry.forEach((day) => selectDay(SelectedDaysKey.LAUNDRY, day));
  }
};
