import { get } from 'firebase/database';
import { SVG_ICON_PATH } from '../constants';
import { syncSelectedDays } from '../feature/schedule';
import type { SelectedDaysValue, Staff, Weekday } from '../types';
import { createSvgIcon, renderCheckboxes } from './render';
import { scheduleRef } from '../firebase';

export const createStaffSelectContainer = async (staffs: Staff[]) => {
  const staffSelectContainer = document.createElement('div');
  staffSelectContainer.id = 'staff-select-container';

  const controlContainer = document.createElement('div');
  controlContainer.id = 'control-container';

  const svgContainer = document.createElement('div');
  svgContainer.id = 'svg-container';

  const staffContainer = document.createElement('div');
  staffContainer.id = 'staff-container';

  const nameForm = document.createElement('form');
  nameForm.type = 'submit';
  nameForm.id = 'name-form';
  nameForm.hidden = true;

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'name-input';
  nameInput.placeholder = '변경할 이름 입력';

  nameForm.appendChild(nameInput);

  const nameButton = document.createElement('input');
  nameButton.type = 'submit';
  nameButton.id = 'name-button';
  nameButton.value = '완료';

  nameForm.appendChild(nameButton);

  Promise.allSettled([
    createSvgIcon(SVG_ICON_PATH.plus),
    createSvgIcon(SVG_ICON_PATH.edit),
    createSvgIcon(SVG_ICON_PATH.trash),
  ]).then((results) => {
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        svgContainer.appendChild(result.value);
      }
    });
  });
  controlContainer.appendChild(nameForm);
  controlContainer.appendChild(svgContainer);

  staffs.forEach(({ name }) => {
    const staffButton = document.createElement('button');
    staffButton.type = 'button';
    staffButton.className = 'staff-button';
    staffButton.id = name;
    staffButton.textContent = name;
    staffContainer.appendChild(staffButton);
  });

  staffSelectContainer.appendChild(controlContainer);
  staffSelectContainer.appendChild(staffContainer);

  return staffSelectContainer;
};

export const createApplyWorkContainer = async (staffName: string) => {
  const applyWorkContainer = document.createElement('div');
  applyWorkContainer.id = 'apply-work-container';

  const nameContainer = document.createElement('div');
  nameContainer.id = 'name-container';

  const nameSign = document.createElement('span');
  nameSign.textContent = '이름 :';
  const nameSpan = document.createElement('span');
  nameSpan.id = 'name';
  nameSpan.textContent = staffName;
  const staffChangeButton = document.createElement('input');
  staffChangeButton.type = 'button';
  staffChangeButton.id = 'staff-change-button';
  staffChangeButton.value = '변경';

  nameContainer.appendChild(nameSign);
  nameContainer.appendChild(nameSpan);
  nameContainer.appendChild(staffChangeButton);

  const div = document.createElement('div');

  const dayForm = document.createElement('form');
  dayForm.id = 'day-form';

  const workTitle = document.createElement('h3');
  workTitle.textContent = '근무';

  const workDayContainer = document.createElement('div');
  workDayContainer.id = 'workday-container';

  const laundryTitle = document.createElement('h3');
  laundryTitle.textContent = '빨래';

  const laundryContainer = document.createElement('div');
  laundryContainer.id = 'laundry-container';

  const scheduleSnapshot = await get(scheduleRef());

  syncSelectedDays(staffName, scheduleSnapshot.val());
  renderCheckboxes();

  dayForm.appendChild(workTitle);
  dayForm.appendChild(workDayContainer);
  dayForm.appendChild(laundryTitle);
  dayForm.appendChild(laundryContainer);

  const submitButtonContainer = document.createElement('div');
  submitButtonContainer.id = 'submit-button-container';

  const submitButton = document.createElement('input');
  submitButton.type = 'submit';
  submitButton.id = 'submit-button';
  submitButton.value = '제출';

  submitButtonContainer.appendChild(submitButton);

  applyWorkContainer.appendChild(nameContainer);
  applyWorkContainer.appendChild(div);

  dayForm.appendChild(submitButtonContainer);
  div.appendChild(dayForm);

  applyWorkContainer.appendChild(nameContainer);
  applyWorkContainer.appendChild(div);

  return applyWorkContainer;
};

export const createCheckbox = (
  day: Weekday,
  selectedDays: SelectedDaysValue,
  role: 'work' | 'laundry'
) => {
  const label = document.createElement('label');
  label.className = 'checkbox-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.dataset.role = role;
  checkbox.dataset.day = day;
  checkbox.value = day;
  checkbox.name = day;
  checkbox.checked = selectedDays.has(day);

  label.append(checkbox, day);

  return { label, checkbox };
};
