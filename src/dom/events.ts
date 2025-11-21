import { resetSchedule, submitSelectedDays } from '../api';
import {
  clearStaffButtonClasses,
  getElement,
  isWeekday,
  toggleStaffButtonClass,
} from '../utils';
import {
  addLaundryDay,
  addWorkDay,
  removeLaundryDay,
  removeWorkDay,
} from '../store';
import { clearSavedName, saveName } from '../feature/name';
import { attachNewbie, editStaff, removeStaffByName } from '../feature/staff';
import {
  createApplyWorkContainer,
  createStaffSelectContainer,
} from './elements';

export const delegateStaffEvents = (parentNode: HTMLElement) => {
  let editMode = false;
  let deleteMode = false;
  let editingTarget: HTMLInputElement | null = null;

  parentNode.addEventListener('click', async (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;

    const staffButtons =
      parentNode.querySelectorAll<HTMLInputElement>('.staff-button');
    const svgs = parentNode.querySelectorAll<SVGSVGElement>(
      '#control-container svg'
    );

    // SVG 클릭 처리
    svgs.forEach(async (svg, index) => {
      if (!svg.contains(target)) return;

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
          clearStaffButtonClasses(staffButtons, 'delete');
          toggleStaffButtonClass(staffButtons, 'edit', editMode);
          break;
        case 2: // 삭제
          editMode = false;
          deleteMode = !deleteMode;
          clearStaffButtonClasses(staffButtons, 'edit');
          toggleStaffButtonClass(staffButtons, 'delete', deleteMode);
          break;
      }
    });

    // staff-button 클릭 처리
    if (
      target instanceof HTMLInputElement &&
      target.classList.contains('staff-button')
    ) {
      if (editMode) {
        const nameForm = getElement('#name-form', HTMLFormElement);
        const nameInput = getElement('#name-input', HTMLInputElement);
        nameForm.hidden = false;
        nameInput.focus();
        editingTarget = target;
        editMode = false;
        return;
      }

      if (deleteMode) {
        if (confirm(`${target.value}을(를) 삭제하시겠습니까?`)) {
          await removeStaffByName(target.value, target);
          deleteMode = false;
          clearStaffButtonClasses(staffButtons, 'delete');
        }
        return;
      }

      saveName(target.value);
      parentNode.replaceChildren(createApplyWorkContainer(target.value));
    }
  });

  parentNode.addEventListener('submit', async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLFormElement) || target.id !== 'name-form')
      return;

    e.preventDefault();
    if (!editingTarget) return;

    const nameInput = getElement('#name-input', HTMLInputElement);
    const newName = nameInput.value.trim();
    if (!newName) return;

    await editStaff(editingTarget.value, newName, editingTarget);
    nameInput.value = '';
    editingTarget = null;
    target.hidden = true;
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
      clearSavedName();
      const staffSelectContainer = await createStaffSelectContainer();
      parentNode.replaceChildren(staffSelectContainer);
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

      if (target.checked) addWorkDay(day);
      else removeWorkDay(day);

      laundryCheckbox.disabled = !target.checked;
      if (!target.checked) {
        laundryCheckbox.checked = false;
        removeLaundryDay(day);
      }
    }

    if (role === 'laundry') {
      if (target.checked) addLaundryDay(day);
      else removeLaundryDay(day);
    }
  });

  // submit-button 이벤트
  parentNode.addEventListener('submit', async (e) => {
    if (!(e.target instanceof HTMLFormElement)) return;
    const form = e.target;
    e.preventDefault();
    if (form.id !== 'day-form') return;

    const name = getElement('#name', HTMLSpanElement);
    if (!name.textContent) return alert('스탭을 선택해주세요');

    await submitSelectedDays(name.textContent);
  });
};

/** 근무표 초기화 버튼 이벤트 */
export const bindResetScheduleEvent = (button: HTMLInputElement) => {
  button.addEventListener('click', async () => {
    if (confirm('근무표를 초기화하시겠습니까?')) await resetSchedule();
  });
};

/** 복사 버튼 이벤트 */
export const bindCopyScheduleEvent = (
  button: HTMLInputElement,
  target: HTMLDivElement
) => {
  button.addEventListener('click', () => {
    let textToCopy = target.innerText;
    textToCopy = textToCopy.replace(/\n{3,}/g, '\n\n');

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
