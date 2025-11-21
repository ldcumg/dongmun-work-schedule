import { fetchStaffs, resetSchedule, submitSelectedDays } from '../api';
import {
  clearStaffButtonClasses,
  getElement,
  isWeekday,
  toggleStaffButtonClass,
} from '../utils';
import { selectDay, deselectDay, clearSelectedDays } from '../store';
import {
  attachNewbie,
  removeSavedStaff,
  editStaff,
  removeStaffByName,
  saveStaff,
} from '../feature/staff';
import {
  createApplyWorkContainer,
  createStaffSelectContainer,
} from './elements';
import { SelectedDaysKey } from '../constants';
import { renderTotalWorkDays } from './render';

export const delegateStaffEvents = (parentNode: HTMLElement) => {
  let editMode: boolean = false;
  let deleteMode: boolean = false;
  let editingTarget: HTMLButtonElement | null = null;

  parentNode.addEventListener('click', async (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;

    const staffButtons =
      parentNode.querySelectorAll<HTMLInputElement>('.staff-button');
    const svgs =
      parentNode.querySelectorAll<SVGSVGElement>('#svg-container svg');

    // SVG 클릭 처리
    svgs.forEach(async (svg, index) => {
      if (!svg.contains(target)) return;
      const nameForm = getElement('#name-form', HTMLFormElement);

      switch (index) {
        case 0: // 추가
          deleteMode = editMode = false;
          clearStaffButtonClasses(staffButtons, 'edit', 'delete');
          if (confirm('신입을 추가하시겠습니까?')) {
            const staffContainer = getElement(
              '#staff-container',
              HTMLDivElement
            );
            await attachNewbie(staffContainer);
          }
          break;
        case 1: // 편집
          deleteMode = false;
          editMode = !editMode;
          clearStaffButtonClasses(staffButtons, 'delete', 'editing');
          toggleStaffButtonClass(staffButtons, 'edit', editMode);
          nameForm.hidden || (nameForm.hidden = true);
          break;
        case 2: // 삭제
          editMode = false;
          deleteMode = !deleteMode;
          clearStaffButtonClasses(staffButtons, 'edit', 'editing');
          toggleStaffButtonClass(staffButtons, 'delete', deleteMode);
          nameForm.hidden || (nameForm.hidden = true);
          break;
      }
    });

    // staff-button 클릭 처리
    if (
      target instanceof HTMLButtonElement &&
      target.classList.contains('staff-button')
    ) {
      const docId = target.dataset.docId!;

      if (editMode) {
        const nameForm = getElement('#name-form', HTMLFormElement);
        const nameInput = getElement('#name-input', HTMLInputElement);
        nameForm.hidden = false;
        nameInput.focus();
        target.classList.add('editing');
        editingTarget = target;
        return;
      }

      if (deleteMode) {
        if (confirm(`${target.textContent}을(를) 삭제하시겠습니까?`)) {
          await removeStaffByName(docId);
          target.remove();
          deleteMode = false;
          clearStaffButtonClasses(staffButtons, 'delete');
        }
        return;
      }

      saveStaff(target.textContent, docId);
      createApplyWorkContainer(target.textContent, docId).then((el) =>
        parentNode.replaceChildren(el)
      );
    }
  });

  parentNode.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'name-form') return;

    e.preventDefault();
    if (!editingTarget) return;

    const nameInput = getElement('#name-input', HTMLInputElement);
    const newName = nameInput.value.trim();
    if (!newName) return;

    await editStaff(editingTarget.dataset.docId!, newName);
    editingTarget.textContent = newName;
    nameInput.value = '';
    editingTarget.classList.remove('editing');
    editingTarget = null;
    form.hidden = true;
    clearStaffButtonClasses(
      parentNode.querySelectorAll<HTMLInputElement>('.staff-button'),
      'edit'
    );
  });
};

export const delegateSubmitEvents = (parentNode: HTMLElement) => {
  // staff-change-button 클릭
  parentNode.addEventListener('click', async (e) => {
    const target = e.target;
    if (
      target instanceof HTMLInputElement &&
      target.id === 'staff-change-button'
    ) {
      removeSavedStaff();
      clearSelectedDays();
      const staffs = await fetchStaffs();
      createStaffSelectContainer(staffs).then((el) =>
        parentNode.replaceChildren(el)
      );
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
        ? selectDay(SelectedDaysKey.WORK, day)
        : deselectDay(SelectedDaysKey.WORK, day);

      laundryCheckbox.disabled = !target.checked;
      if (!target.checked) {
        laundryCheckbox.checked = false;
        deselectDay(SelectedDaysKey.LAUNDRY, day);
      }
    }

    if (role === 'laundry') {
      target.checked
        ? selectDay(SelectedDaysKey.LAUNDRY, day)
        : deselectDay(SelectedDaysKey.LAUNDRY, day);
    }
  });

  // submit-day-form 이벤트
  parentNode.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'day-form') return;
    e.preventDefault();

    const name = getElement('#name', HTMLSpanElement);
    if (!name.textContent) return alert('스탭을 선택해주세요');

    await submitSelectedDays(name.textContent, name.dataset.docId!);

    const cumulationContainer = getElement(
      '#cumulation-container',
      HTMLDivElement
    );
    const staffs = await fetchStaffs();
    renderTotalWorkDays(cumulationContainer, staffs);
  });
};

/** 근무표 초기화 버튼 이벤트 */
export const bindResetScheduleEvent = (button: HTMLInputElement) => {
  button.addEventListener('click', async () => {
    if (confirm('근무표를 초기화하시겠습니까?')) await resetSchedule();
  });
};

/** 근무표 복사 버튼 이벤트 */
export const bindCopyScheduleEvent = (
  button: HTMLInputElement,
  target: HTMLDivElement
) => {
  button.addEventListener('click', () => {
    const textToCopy = target.innerText.replace(/\n{3,}/g, '\n\n');

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        button.value = '복사됨';
        setTimeout(() => {
          button.value = '복사';
        }, 500);
      })
      .catch((err) => {
        alert('복사 실패');
        console.error('복사 실패:', err);
      });
  });
};
