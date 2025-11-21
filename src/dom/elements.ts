import { get } from 'firebase/database';
import { SVG_ICON_PATH } from '../constants';
import { syncSelectedDays } from '../feature/schedule';
import type { SelectedDaysValue, Staff, Weekday } from '../types';
import { createSvgIcon, renderCheckboxes } from './render';
import { scheduleRef } from '../firebase';
import { createEl } from '../utils';

const appendSvgIcons = async (container: HTMLElement, paths: string[]) => {
  const results = await Promise.allSettled(paths.map(createSvgIcon));
  results.forEach((res) => {
    if (res.status === 'fulfilled' && res.value)
      container.appendChild(res.value);
  });
};

export const createStaffSelectContainer = async (staffs: Staff[]) => {
  const staffSelectContainer = createEl('div', {
    id: 'staff-select-container',
  });

  const controlContainer = createEl('div', { id: 'control-container' });
  const svgContainer = createEl('div', { id: 'svg-container' });
  const staffContainer = createEl('div', { id: 'staff-container' });

  const nameForm = createEl('form', { id: 'name-form', hidden: true });
  const nameInput = createEl('input', {
    type: 'text',
    id: 'name-input',
    placeholder: '변경할 이름 입력',
  });
  const nameButton = createEl('input', {
    type: 'submit',
    id: 'name-button',
    value: '완료',
  });

  nameForm.append(nameInput, nameButton);
  controlContainer.append(nameForm, svgContainer);

  await appendSvgIcons(svgContainer, [
    SVG_ICON_PATH.plus,
    SVG_ICON_PATH.edit,
    SVG_ICON_PATH.trash,
  ]);

  staffs.forEach(({ name }) => {
    const staffButton = createEl('button', {
      type: 'button',
      className: 'staff-button',
      id: name,
      textContent: name,
    });
    staffContainer.appendChild(staffButton);
  });

  staffSelectContainer.append(controlContainer, staffContainer);
  return staffSelectContainer;
};

export const createApplyWorkContainer = async (staffName: string) => {
  const applyWorkContainer = createEl('div', { id: 'apply-work-container' });
  const nameContainer = createEl('div', { id: 'name-container' });

  const nameSign = createEl('span', { textContent: '이름 :' });
  const nameSpan = createEl('span', { id: 'name', textContent: staffName });
  const staffChangeButton = createEl('input', {
    type: 'button',
    id: 'staff-change-button',
    value: '변경',
  });

  nameContainer.append(nameSign, nameSpan, staffChangeButton);

  const dayForm = createEl('form', { id: 'day-form' });
  const workTitle = createEl('h3', { textContent: '근무' });
  const workDayContainer = createEl('div', { id: 'workday-container' });
  const laundryTitle = createEl('h3', { textContent: '빨래' });
  const laundryContainer = createEl('div', { id: 'laundry-container' });

  const scheduleSnapshot = await get(scheduleRef());
  syncSelectedDays(staffName, scheduleSnapshot.val());
  renderCheckboxes(workDayContainer, laundryContainer);

  const submitButtonContainer = createEl('div', {
    id: 'submit-button-container',
  });
  const submitButton = createEl('input', {
    type: 'submit',
    id: 'submit-button',
    value: '제출',
  });
  submitButtonContainer.appendChild(submitButton);

  dayForm.append(
    workTitle,
    workDayContainer,
    laundryTitle,
    laundryContainer,
    submitButtonContainer
  );

  applyWorkContainer.append(nameContainer, dayForm);
  return applyWorkContainer;
};

export const createCheckbox = (
  day: Weekday,
  selectedDays: SelectedDaysValue,
  role: 'work' | 'laundry'
) => {
  const label = createEl('label', { className: 'checkbox-label' });
  const checkbox = createEl('input', {
    type: 'checkbox',
    value: day,
    name: day,
  });
  checkbox.dataset.role = role;
  checkbox.dataset.day = day;
  checkbox.checked = selectedDays.has(day);

  label.append(checkbox, day);
  return { label, checkbox };
};
