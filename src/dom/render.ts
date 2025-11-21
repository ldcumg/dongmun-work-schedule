import { WEEKDAYS } from '../constants';
import { getSelectedLaundryDays, getSelectedWorkDays } from '../store';
import { getPeopleForDay, getSmartWeekRange } from '../utils';
import type { ScheduleData } from '../types';
import { createCheckbox } from './elements';

export const createSvgIcon = async (path: string) => {
  const response = await fetch(path);
  const svgText = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) return null;

  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('fill', 'currentColor');

  return svg;
};

export const renderCheckboxes = (
  workDayContainer: HTMLDivElement,
  laundryContainer: HTMLDivElement
) => {
  const workFrag = document.createDocumentFragment();
  const laundryFrag = document.createDocumentFragment();

  WEEKDAYS.forEach((day) => {
    const selectedWorkDays = getSelectedWorkDays();
    const selectedLaundryDays = getSelectedLaundryDays();

    const { label: workLabel, checkbox: workCheckbox } = createCheckbox(
      day,
      selectedWorkDays,
      'work'
    );
    const { label: laundryLabel, checkbox: laundryCheckbox } = createCheckbox(
      day,
      selectedLaundryDays,
      'laundry'
    );

    laundryCheckbox.disabled = !selectedWorkDays.has(day);

    workLabel.dataset.day = day;
    laundryLabel.dataset.day = day;
    workCheckbox.dataset.role = 'work';
    laundryCheckbox.dataset.role = 'laundry';

    workFrag.appendChild(workLabel);
    laundryFrag.appendChild(laundryLabel);
  });

  workDayContainer.replaceChildren(workFrag);
  laundryContainer.replaceChildren(laundryFrag);
};

/** 이번주 근무 기간 렌더링 */
export const renderWeekRange = (weekRangeContainer: HTMLDivElement) => {
  const [start, end] = getSmartWeekRange();
  weekRangeContainer.textContent = `${
    start.getMonth() + 1
  }월 ${start.getDate()}일부터 ${
    end.getMonth() + 1
  }월 ${end.getDate()}일까지 🗓`;
};

/** 근무 스케줄 렌더링 */
export const renderSchedule = async (
  scheduleContainer: HTMLDivElement,
  numberWorkContainer: HTMLDivElement,
  scheduleData: ScheduleData
) => {
  scheduleContainer.innerText = WEEKDAYS.map((day) => {
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

  numberWorkContainer.innerText = Object.keys(numberOfWorkData)
    .sort((a, b) => Number(b) - Number(a))
    .map((days) => `${[...numberOfWorkData[days]].join(' ')} ${days}일`)
    .join('\n');
};
