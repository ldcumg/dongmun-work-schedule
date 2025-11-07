import { WEEKDAYS } from './constants.js';
import { lsSavedName } from './name.js';
import { getPeopleForDay } from './utils.js';
import { renderCheckboxes } from './dom/events.js';
import { addWorkDay, addLaundryDay } from './store.js';

const $scheduleContainer = document.querySelector('#schedule-container');
const $numberWorkContainer = document.querySelector('#work-number-container');

/** 선택된 날들을 스케줄 데이터에서 동기화 */
export const syncSelectedDaysFromData = (scheduleData) => {
  if (!scheduleData || !scheduleData[lsSavedName]) {
    return;
  }

  const { work, laundry } = scheduleData[lsSavedName];

  work?.forEach((day) => addWorkDay(day));
  laundry?.forEach((day) => addLaundryDay(day));

  renderCheckboxes();
};

/** 근무 스케줄 렌더링 */
export const renderSchedule = async (scheduleData) => {
  $scheduleContainer.innerText = WEEKDAYS.map((day) => {
    const work = getPeopleForDay(scheduleData, 'work', day);
    const laundry = getPeopleForDay(scheduleData, 'laundry', day);
    return `${day} ${work.join(' ')} / ${laundry.join(' ')}`;
  }).join('\n');

  const numberOfWorkData = {};
  for (const name in scheduleData) {
    if (!scheduleData.hasOwnProperty(name)) continue;
    const workDays = scheduleData[name].work.length;
    (numberOfWorkData[workDays] ??= new Set()).add(name);
  }

  $numberWorkContainer.innerText = Object.keys(numberOfWorkData)
    .sort((a, b) => b - a)
    .map((days) => `${[...numberOfWorkData[days]].join(' ')} ${days}일`)
    .join('\n');
};
