import { SelectedDaysKey, SVG_ICON_PATH, WEEKDAYS } from '../constants';
import { syncSelectedDays } from '../feature/schedule';
import { getSelectedDays } from '../store';
import type { ScheduleData, SelectedDaysValue, Staff, Weekday } from '../types';
import { appendSvgIcons, createEl } from '../utils';

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

export const createWeeklyCheckboxFrag = () => {
  const selectedWorkDays = getSelectedDays(SelectedDaysKey.WORK);
  const selectedLaundryDays = getSelectedDays(SelectedDaysKey.LAUNDRY);

  const workCheckboxesFrag = document.createDocumentFragment();
  const laundryCheckboxesFrag = document.createDocumentFragment();

  WEEKDAYS.forEach((day) => {
    const { label: workLabel } = createCheckbox(day, selectedWorkDays, 'work');
    const { label: laundryLabel, checkbox: laundryCheckbox } = createCheckbox(
      day,
      selectedLaundryDays,
      'laundry'
    );

    laundryCheckbox.disabled = !selectedWorkDays.has(day);

    workCheckboxesFrag.appendChild(workLabel);
    laundryCheckboxesFrag.appendChild(laundryLabel);
  });

  return { workCheckboxesFrag, laundryCheckboxesFrag };
};

export const createStaffSelectChildren = async (staffs: Staff[]) => {
  const controlContainer = createEl('div', { id: 'control-container' });
  const svgContainer = createEl('div', { id: 'svg-container' });
  const staffContainer = createEl('div', { id: 'staff-container' });

  const nameForm = createEl('form', { id: 'name-form', hidden: true });
  const nameInput = createEl('input', {
    type: 'text',
    id: 'name-input',
    placeholder: '변경할 이름 입력',
  });
  const nameButton = createEl('button', {
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

  staffs.forEach(({ name, docId }) => {
    const staffButton = createEl('button', {
      type: 'button',
      className: 'staff-button',
      textContent: name,
      dataset: { docId },
    });
    staffContainer.appendChild(staffButton);
  });

  return [controlContainer, staffContainer];
};

export const createApplyWorkChildren = (
  staffName: string,
  docId: string,
  scheduleData: ScheduleData
) => {
  const nameContainer = createEl('div', { id: 'name-container' });

  const nameSign = createEl('span', { textContent: '이름 :' });
  const nameSpan = createEl('span', {
    id: 'name',
    textContent: staffName,
    dataset: { docId },
  });
  const staffChangeButton = createEl('button', {
    type: 'button',
    id: 'staff-change-button',
    textContent: '변경',
  });

  nameContainer.append(nameSign, nameSpan, staffChangeButton);

  const dayForm = createEl('form', { id: 'day-form' });
  const workTitle = createEl('h3', { textContent: '근무' });
  const workDayContainer = createEl('div', { id: 'workday-container' });
  const laundryTitle = createEl('h3', { textContent: '빨래' });
  const laundryContainer = createEl('div', { id: 'laundry-container' });

  syncSelectedDays(staffName, scheduleData);
  const { workCheckboxesFrag, laundryCheckboxesFrag } =
    createWeeklyCheckboxFrag();
  workDayContainer.appendChild(workCheckboxesFrag);
  laundryContainer.appendChild(laundryCheckboxesFrag);

  const submitButtonContainer = createEl('div', {
    id: 'submit-button-container',
  });
  const submitButton = createEl('button', {
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

  return [nameContainer, dayForm];
};
