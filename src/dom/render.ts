import { SelectedDays, SVG_ICON_PATH, WEEKDAYS } from '../constants';
import {
  appendSvgIcons,
  createElement,
  getPeopleForDay,
  getSmartWeekRange,
} from '../utils';
import type { ScheduleData, StaffData } from '../types';
import { getSelectedDays } from '../store';
import { createCheckbox } from './elements';

export const renderStaffSection = async (
  selectSection: HTMLElement,
  staffs: StaffData[],
  init?: boolean
) => {
  const controlContainer = createElement('div', { id: 'control-container' });
  const svgContainer = createElement('div', { id: 'svg-container' });
  const staffContainer = createElement('div', { id: 'staff-container' });

  const nameForm = createElement('form', { id: 'name-form', hidden: true });
  const nameInput = createElement('input', {
    type: 'text',
    id: 'name-input',
    placeholder: '변경할 이름 입력',
  });
  const nameButton = createElement('button', {
    type: 'submit',
    id: 'name-button',
    textContent: '완료',
  });

  nameForm.append(nameInput, nameButton);
  controlContainer.append(nameForm, svgContainer);

  await appendSvgIcons(svgContainer, [
    SVG_ICON_PATH.plus,
    SVG_ICON_PATH.edit,
    SVG_ICON_PATH.trash,
  ]);

  staffs.forEach(({ name, staffKey }) => {
    const staffButton = createElement('button', {
      type: 'button',
      className: 'staff-button',
      textContent: name,
      dataset: { staffKey },
    });
    staffContainer.appendChild(staffButton);
  });

  init
    ? selectSection.append(controlContainer, staffContainer)
    : selectSection.replaceChildren(controlContainer, staffContainer);
};

export const renderApplySection = (
  selectSection: HTMLElement,
  staffName: string,
  staffKey: string,
  init?: boolean
) => {
  const nameContainer = createElement('div', { id: 'name-container' });

  const nameSign = createElement('span', { textContent: '이름 :' });
  const nameSpan = createElement('span', {
    id: 'name',
    textContent: staffName,
    dataset: { staffKey },
  });
  const staffChangeButton = createElement('button', {
    type: 'button',
    id: 'staff-change-button',
    textContent: '변경',
  });

  nameContainer.append(nameSign, nameSpan, staffChangeButton);

  const dayForm = createElement('form', { id: 'day-form' });
  const workTitle = createElement('h3', { textContent: '근무' });
  const workDayContainer = createElement('div', { id: 'workday-container' });
  const laundryTitle = createElement('h3', { textContent: '빨래' });
  const laundryContainer = createElement('div', { id: 'laundry-container' });

  const selectedWorkDays = getSelectedDays(SelectedDays.WORK);
  const selectedLaundryDays = getSelectedDays(SelectedDays.LAUNDRY);

  WEEKDAYS.forEach((day) => {
    const { label: workLabel } = createCheckbox(day, selectedWorkDays, 'work');
    const { label: laundryLabel, checkbox: laundryCheckbox } = createCheckbox(
      day,
      selectedLaundryDays,
      'laundry'
    );

    laundryCheckbox.disabled = !selectedWorkDays.has(day);

    workDayContainer.appendChild(workLabel);
    laundryContainer.appendChild(laundryLabel);
  });

  const submitButtonContainer = createElement('div', {
    id: 'submit-button-container',
  });
  const submitButton = createElement('button', {
    type: 'submit',
    id: 'submit-button',
    textContent: '제출',
  });
  submitButtonContainer.appendChild(submitButton);

  dayForm.append(
    workTitle,
    workDayContainer,
    laundryTitle,
    laundryContainer,
    submitButtonContainer
  );

  init
    ? selectSection.append(nameContainer, dayForm)
    : selectSection.replaceChildren(nameContainer, dayForm);
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
  scheduleContainer.innerText = WEEKDAYS.map((day) => {
    const work = getPeopleForDay(scheduleData, 'work', day);
    const laundry = getPeopleForDay(scheduleData, 'laundry', day);
    return `${day} ${work.join(' ')} / ${laundry.join(' ')}`;
  }).join('\n');

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
  staffs: StaffData[]
) => {
  let result = '';

  for (let i = 0; i < staffs.length; i++) {
    const staff = staffs[i];
    const workDays = staff.workDays;

    if (!workDays) continue;

    let total = 0;
    for (const key in workDays) {
      total += workDays[key];
    }

    result += `${staff.name} ${total}일`;
    if (i < staffs.length - 1) result += '\n';
  }

  cumulationContainer.innerText = result;
};
