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
import { get, remove, set } from 'firebase/database';
import { scheduleRef } from '../firebase';

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
          if (confirm('신입을 추가하시겠습니까?')) {
            const staffContainer = getElement(
              '#staff-container',
              HTMLDivElement
            );
            await attachNewbie(staffContainer);
          }
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
      const docId = target.dataset.docId;
      if (!docId) return;

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
        if (confirm(`${target.textContent}을(를) 삭제하시겠습니까?`)) {
          await removeStaffByName(docId);
          const targetRef = scheduleRef(target.textContent);
          get(targetRef).then((snapshot) => {
            snapshot.exists() && remove(targetRef);
          });
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
    if (!editingTarget || !editingTarget.dataset.docId) return;

    const nameInput = getElement('#name-input', HTMLInputElement);
    const newName = nameInput.value.trim();
    if (!newName) return;

    await editStaff(editingTarget.dataset.docId, newName);
    const targetRef = scheduleRef(editingTarget.textContent);
    get(targetRef)
      .then((snapshot) => {
        snapshot.exists() && set(scheduleRef(newName), snapshot.val());
        return snapshot;
      })
      .then((snapshot) => {
        snapshot.exists() && remove(targetRef);
      });
    editingTarget.textContent = newName;
    nameInput.value = '';
    editingTarget.classList.remove('editing');
    editingTarget = null;
    editMode = false;
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
    if (!name.dataset.docId) return;

    await submitSelectedDays(name.textContent, name.dataset.docId);

    const cumulationContainer = getElement(
      '#cumulation-container',
      HTMLDivElement
    );
    const staffs = await fetchStaffs();
    renderTotalWorkDays(cumulationContainer, staffs);
  });
};

/** 근무표 초기화 버튼 이벤트 */
export const bindResetScheduleEvent = (button: HTMLButtonElement) => {
  button.addEventListener('click', async () => {
    if (
      confirm(
        '일요일 오후 4시 이후에 초기화해주세요.\n근무표를 초기화하시겠습니까?'
      )
    )
      await resetSchedule();
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
