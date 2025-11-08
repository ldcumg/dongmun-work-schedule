import { WEEKDAYS } from './constants';
import { getSavedName } from './name';
import { getPeopleForDay } from './utils';
import { renderCheckboxes } from './dom/events';
import { addWorkDay, addLaundryDay } from './store';
import type { ScheduleData } from './type';

const $scheduleContainer = document.querySelector('#schedule-container');
const $numberWorkContainer = document.querySelector('#work-number-container');

/** 선택된 날들을 스케줄 데이터에서 동기화 */
export const syncSelectedDaysFromData = (scheduleData: ScheduleData) => {
  const savedName = getSavedName();
  if (savedName) {
    const userData = scheduleData?.[savedName];
    if (userData) {
      const { work, laundry } = userData;

      work?.forEach((day) => addWorkDay(day));
      laundry?.forEach((day) => addLaundryDay(day));
    }
  }

  renderCheckboxes();
};

/** 근무 스케줄 렌더링 */
export const renderSchedule = async (scheduleData: ScheduleData) => {
  if ($scheduleContainer instanceof HTMLDivElement)
    $scheduleContainer.innerText = WEEKDAYS.map((day) => {
      const work = getPeopleForDay(scheduleData, 'work', day);
      const laundry = getPeopleForDay(scheduleData, 'laundry', day);
      return `${day} ${work.join(' ')} / ${laundry.join(' ')}`;
    }).join('\n');

  const numberOfWorkData: { [key: string]: Set<string> } = {};
  for (const name in scheduleData) {
    if (!scheduleData.hasOwnProperty(name)) continue;
    const workDays = String(scheduleData[name].work.length);
    (numberOfWorkData[workDays] ??= new Set()).add(name);
  }

  if ($numberWorkContainer instanceof HTMLDivElement)
    $numberWorkContainer.innerText = Object.keys(numberOfWorkData)
      .sort((a, b) => Number(b) - Number(a))
      .map((days) => `${[...numberOfWorkData[days]].join(' ')} ${days}일`)
      .join('\n');
};
