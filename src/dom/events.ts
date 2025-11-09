import { WEEKDAYS } from '../constants';
import { $nameInput, $workdayContainer, $laundryContainer } from './elements';
import { createCheckbox } from '../features/weekdays';
import { setEditingState, saveName } from '../features/name';
import { submitSelectedDays, resetSchedule } from '../api';
import { getNextWeekRangeFromToday } from '../utils';
import {
  getSelectedWorkDays,
  getSelectedLaundryDays,
  addWorkDay,
  addLaundryDay,
  removeWorkDay,
  removeLaundryDay,
  resetSelectedDays,
} from '../store';

const $nameForm = document.querySelector('#name-container');
const $submitScheduleButton = document.querySelector('#submit-button');
const $weekRangeContainer = document.querySelector('#week-range-container');
const $resetScheduleButton = document.querySelector('#reset-schedule-button');
const $scheduleDisplayContainer = document.getElementById('schedule-display');
const $copyButton = document.getElementById('copy-button');

export const setNameEvent = () => {
  if ($nameForm instanceof HTMLFormElement)
    $nameForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if ($nameInput instanceof HTMLInputElement)
        if ($nameInput.disabled) {
          // $nameInput.value = '';
          setEditingState(true);
        } else {
          saveName();
        }
    });
};

export const renderCheckboxes = () => {
  const workFrag = document.createDocumentFragment();
  const laundryFrag = document.createDocumentFragment();

  WEEKDAYS.forEach((day) => {
    const selectedWorkDays = getSelectedWorkDays();
    const selectedLaundryDays = getSelectedLaundryDays();

    const { label: workLabel, checkbox: workCheckbox } = createCheckbox(
      day,
      selectedWorkDays
    );
    const { label: laundryLabel, checkbox: laundryCheckbox } = createCheckbox(
      day,
      selectedLaundryDays
    );

    laundryCheckbox.disabled = !selectedWorkDays.has(day);

    workCheckbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) addWorkDay(day);
      else removeWorkDay(day);

      laundryCheckbox.disabled = !target.checked;
      if (!target.checked) {
        laundryCheckbox.checked = false;
        removeLaundryDay(day);
      }
    });

    laundryCheckbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) addLaundryDay(day);
      else removeLaundryDay(day);
    });

    workFrag.appendChild(workLabel);
    laundryFrag.appendChild(laundryLabel);
  });

  $workdayContainer instanceof HTMLDivElement &&
    $workdayContainer.appendChild(workFrag);
  $laundryContainer instanceof HTMLDivElement &&
    $laundryContainer.appendChild(laundryFrag);
};

export const handleSubmitEvent = () => {
  if ($submitScheduleButton instanceof HTMLInputElement)
    $submitScheduleButton.addEventListener('click', async () => {
      if ($nameInput instanceof HTMLInputElement) {
        if (!$nameInput.value) return alert('이름을 입력해주세요');
        if ($nameInput.value.length !== 2)
          return alert('이름을 두 글자로 입력해주세요');
        saveName();
        await submitSelectedDays($nameInput.value);
      }
    });
};

/** 이번주 근무 기간 렌더링 */
export const renderWeekRange = () => {
  const [start, end] = getNextWeekRangeFromToday();
  if ($weekRangeContainer instanceof HTMLDivElement)
    $weekRangeContainer.textContent = `${
      start.getMonth() + 1
    }월 ${start.getDate()}일부터 ${
      end.getMonth() + 1
    }월 ${end.getDate()}일까지 🗓`;
};

/** 근무표 초기화 버튼 이벤트 */
export const resetScheduleEvent = () => {
  if ($resetScheduleButton instanceof HTMLInputElement)
    $resetScheduleButton.addEventListener('click', async () => {
      if (!confirm('근무표를 초기화하시겠습니까?')) return;

      await resetSchedule();
      resetSelectedDays();

      if ($workdayContainer instanceof HTMLDivElement) {
        $workdayContainer
          .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
          .forEach((checkbox) => {
            if (checkbox.checked) checkbox.checked = false;
          });
      }

      if ($laundryContainer instanceof HTMLDivElement) {
        $laundryContainer
          .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
          .forEach((checkbox) => {
            if (checkbox.checked) checkbox.checked = false;
          });
      }
    });
};

/** 복사 버튼 이벤트 */
export const copyScheduleEvent = () => {
  if ($copyButton instanceof HTMLInputElement)
    $copyButton.addEventListener('click', () => {
      if ($scheduleDisplayContainer instanceof HTMLDivElement) {
        let textToCopy = $scheduleDisplayContainer.innerText;
        textToCopy = textToCopy.replace(/\n{3,}/g, '\n\n');

        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            $copyButton.value = '복사됨';

            setTimeout(() => {
              $copyButton.value = '복사';
            }, 500);
          })
          .catch((err) => {
            alert('복사 실패');
            console.error('복사 실패:', err);
          });
      }
    });
};
