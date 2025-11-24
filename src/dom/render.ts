import { SelectedDaysKey, WEEKDAYS } from '../constants';
import { getSelectedDays } from '../store';
import { getElement, getPeopleForDay, getSmartWeekRange } from '../utils';
import type { ScheduleData, Staff } from '../types';
import { createCheckbox } from './elements';

export const renderCheckboxes = (
  workDayContainer: HTMLDivElement = getElement(
    '#workday-container',
    HTMLDivElement
  ),
  laundryContainer: HTMLDivElement = getElement(
    '#laundry-container',
    HTMLDivElement
  )
) => {
  const workFrag = document.createDocumentFragment();
  const laundryFrag = document.createDocumentFragment();

  const selectedWorkDays = getSelectedDays(SelectedDaysKey.WORK);
  const selectedLaundryDays = getSelectedDays(SelectedDaysKey.LAUNDRY);

  WEEKDAYS.forEach((day) => {
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

    workFrag.append(workLabel);
    laundryFrag.append(laundryLabel);
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
export const renderSchedule = (
  scheduleContainer: HTMLDivElement,
  numberWorkContainer: HTMLDivElement,
  scheduleData: ScheduleData
) => {
  // 요일별 근무 / 빨래 사람
  scheduleContainer.innerText = WEEKDAYS.map((day) => {
    const work = getPeopleForDay(scheduleData, 'work', day);
    const laundry = getPeopleForDay(scheduleData, 'laundry', day);
    return `${day} ${work.join(' ')} / ${laundry.join(' ')}`;
  }).join('\n');

  // 근무일수별 사람
  const numberOfWorkData: Record<string, Set<string>> = {};
  for (const name in scheduleData) {
    const workDays = scheduleData[name].work.length.toString();
    (numberOfWorkData[workDays] ??= new Set()).add(name);
  }

  const entries = Object.entries(numberOfWorkData).sort(
    (a, b) => Number(b[0]) - Number(a[0])
  );

  let numberWorkText = '';
  for (let i = 0; i < entries.length; i++) {
    const days = entries[i][0];
    const namesSet = entries[i][1];

    let names = '';
    for (const name of namesSet) {
      names += name + ' ';
    }

    numberWorkText += names + days + '일';
    if (i !== entries.length - 1) numberWorkText += '\n';
  }

  numberWorkContainer.innerText = numberWorkText;
};

/** 누적 근무일수 렌더링 */
export const renderTotalWorkDays = (
  cumulationContainer: HTMLDivElement,
  staffs: Staff[]
) => {
  let cumulationText = '';
  for (let i = 0; i < staffs.length; i++) {
    const staff = staffs[i];
    const totalWorkDays = Object.values(staff.workDays).reduce(
      (sum, v) => sum + v,
      0
    );
    cumulationText += `${staff.name} ${totalWorkDays}일`;
    if (i !== staffs.length - 1) cumulationText += '\n';
  }

  cumulationContainer.innerText = cumulationText;
};
