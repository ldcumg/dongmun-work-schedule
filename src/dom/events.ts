import {
  clearStaffButtonClasses,
  getNewbieName,
  getElement,
  isWeekday,
  toggleStaffButtonClass,
} from '../utils';
import {
  selectDay,
  deselectDay,
  clearSelectedDays,
  getScheduleData,
  getStaffData,
  syncSelectedDays,
} from '../store';
import {
  addNewbie,
  changeStaffName,
  removeStaff,
  submitSelectedDays,
} from '../services';
import { renderApplySection, renderStaffSection } from './render';
import { SelectedDays } from '../constants';
import { removeSavedStaff, saveStaff } from '../localStorage';

export const delegateStaffEvents = (parentNode: HTMLElement) => {
  let editMode: boolean = false;
  let deleteMode: boolean = false;
  let editingTarget: HTMLButtonElement | null = null;

  parentNode.addEventListener('click', async (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;

    const staffButtons =
      parentNode.querySelectorAll<HTMLButtonElement>('.staff-button');
    const svgs =
      parentNode.querySelectorAll<SVGSVGElement>('#svg-container svg');

    // SVG 클릭 처리
    svgs.forEach(async (svg, index) => {
      if (!svg.contains(target)) return;
      const nameForm = getElement('#name-form', HTMLFormElement);

      switch (index) {
        case 0: // 추가
          editMode = deleteMode = false;
          nameForm.hidden || (nameForm.hidden = true);
          clearStaffButtonClasses(staffButtons, 'edit', 'delete');
          const newbieName = getNewbieName();
          if (confirm(`${newbieName}을(를) 추가하시겠습니까?`))
            await addNewbie(newbieName);
          break;
        case 1: // 편집
          editMode = !editMode;
          clearStaffButtonClasses(staffButtons, 'delete', 'editing');
          toggleStaffButtonClass(staffButtons, 'edit', editMode);
          deleteMode && (deleteMode = false);
          editingTarget && (editingTarget = null);
          nameForm.hidden || (nameForm.hidden = true);
          break;
        case 2: // 삭제
          deleteMode = !deleteMode;
          clearStaffButtonClasses(staffButtons, 'edit', 'editing');
          toggleStaffButtonClass(staffButtons, 'delete', deleteMode);
          editMode && (editMode = false);
          editingTarget && (editingTarget = null);
          nameForm.hidden || (nameForm.hidden = true);
          break;
      }
    });

    // staff-button 클릭 처리
    if (
      target instanceof HTMLButtonElement &&
      target.classList.contains('staff-button')
    ) {
      const staffKey = target.dataset.staffKey;
      if (!staffKey) return;
      const scheduleData = getScheduleData();
      const targetName = target.textContent;

      if (editMode) {
        const nameForm = getElement('#name-form', HTMLFormElement);
        const nameInput = getElement('#name-input', HTMLInputElement);
        editingTarget = target;
        nameForm.hidden
          ? (nameForm.hidden = false)
          : clearStaffButtonClasses(staffButtons, 'editing');
        target.classList.add('editing');
        nameInput.focus();
        return;
      }

      if (deleteMode) {
        if (confirm(`${targetName}을(를) 삭제하시겠습니까?`)) {
          await removeStaff(staffKey, targetName, scheduleData);
          deleteMode = false;
          clearStaffButtonClasses(staffButtons, 'delete');
        }
        return;
      }

      saveStaff(targetName, staffKey);
      syncSelectedDays(targetName, scheduleData);
      renderApplySection(parentNode, targetName, staffKey);
    }
  });

  parentNode.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'name-form') return;

    e.preventDefault();
    if (!editingTarget || !editingTarget.dataset.staffKey) return;

    const nameInput = getElement('#name-input', HTMLInputElement);
    const newName = nameInput.value.trim();
    if (!newName) return;

    await changeStaffName(
      editingTarget.dataset.staffKey,
      editingTarget.textContent,
      newName
    );

    editingTarget.textContent = newName;
    editingTarget.classList.remove('editing');
    editingTarget = null;
    editMode = false;
    nameInput.value = '';
    form.hidden = true;
    clearStaffButtonClasses(
      parentNode.querySelectorAll<HTMLButtonElement>('.staff-button'),
      'edit'
    );
  });
};

export const delegateSubmitEvents = (parentNode: HTMLElement) => {
  // staff-change-button 클릭
  parentNode.addEventListener('click', async (e) => {
    const target = e.target;
    if (
      target instanceof HTMLButtonElement &&
      target.id === 'staff-change-button'
    ) {
      removeSavedStaff();
      clearSelectedDays();
      const staffs = getStaffData();
      renderStaffSection(parentNode, staffs);
    }
  });

  // checkbox change
  parentNode.addEventListener('change', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;

    const role = target.dataset.role;
    const dayStr = target.dataset.day;
    if (!role || !dayStr || !isWeekday(dayStr)) return;
    const day = dayStr;

    if (role === 'work') {
      const laundryCheckbox = parentNode.querySelector<HTMLInputElement>(
        `input[data-role="laundry"][data-day="${day}"]`
      );
      if (!laundryCheckbox) return;

      target.checked
        ? selectDay(SelectedDays.WORK, day)
        : deselectDay(SelectedDays.WORK, day);

      laundryCheckbox.disabled = !target.checked;
      if (!target.checked) {
        laundryCheckbox.checked = false;
        deselectDay(SelectedDays.LAUNDRY, day);
      }
    }

    if (role === 'laundry') {
      target.checked
        ? selectDay(SelectedDays.LAUNDRY, day)
        : deselectDay(SelectedDays.LAUNDRY, day);
    }
  });

  // submit-day-form 이벤트
  parentNode.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'day-form') return;

    const name = getElement('#name', HTMLSpanElement);
    if (!name.dataset.staffKey) return;

    await submitSelectedDays(name.textContent, name.dataset.staffKey);
  });
};

/** 근무표 복사 버튼 이벤트 */
export const bindCopyScheduleEvent = (
  button: HTMLButtonElement,
  target: HTMLDivElement
) => {
  button.addEventListener('click', () => {
    const textToCopy = target.innerText.replace(/\n{3,}/g, '\n\n').trimEnd();

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        button.textContent = '복사됨';
        setTimeout(() => {
          button.textContent = '복사';
        }, 500);
      })
      .catch((err) => {
        alert('복사 실패');
        console.error('복사 실패:', err);
      });
  });
};
