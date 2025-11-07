import { WEEKDAYS } from '../constants.js';
import {
  $nameInput,
  $workdayContainer,
  $laundryContainer,
} from './elements.js';
import { createCheckbox } from '../weekdays.js';
import { renderSchedule } from '../schedule.js';
import { setEditingState, saveLsName } from '../name.js';
import { submitSelectedDays, resetSchedule } from '../api.js';
import { getNextWeekRangeFromToday } from '../utils.js';
import {
  getSelectedWorkDays,
  getSelectedLaundryDays,
  addWorkDay,
  addLaundryDay,
  removeWorkDay,
  removeLaundryDay,
  resetSelectedDays,
} from '../store.js';

const $nameForm = document.querySelector('#name-form');
const $submitScheduleButton = document.querySelector('#submit-button');
const $weekRangeContainer = document.querySelector('#week-range-container');
const $resetScheduleButton = document.querySelector('#reset-schedule-button');
const $scheduleDisplayContainer = document.getElementById('schedule-display');
const $copyButton = document.getElementById('copy-button');

export const setNameEvent = () => {
  $nameForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if ($nameInput.disabled) {
      // $nameInput.value = '';
      setEditingState(true);
    } else {
      saveLsName();
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
      if (e.target.checked) addWorkDay(day);
      else removeWorkDay(day);

      laundryCheckbox.disabled = !e.target.checked;
      if (!e.target.checked) {
        laundryCheckbox.checked = false;
        removeLaundryDay(day);
      }
    });

    laundryCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) addLaundryDay(day);
      else removeLaundryDay(day);
    });

    workFrag.appendChild(workLabel);
    laundryFrag.appendChild(laundryLabel);
  });

  $workdayContainer.appendChild(workFrag);
  $laundryContainer.appendChild(laundryFrag);
};

export const handleSubmitEvent = () => {
  $submitScheduleButton.addEventListener('click', async () => {
    if (!$nameInput.value) return alert('이름을 입력해주세요');
    if ($nameInput.value.length !== 2)
      return alert('이름을 두 글자로 입력해주세요');
    saveLsName();
    await submitSelectedDays($nameInput.value, {
      work: [...getSelectedWorkDays()],
      laundry: [...getSelectedLaundryDays()],
    });
  });
};

/** 이번주 근무 기간 렌더링 */
const [start, end] = getNextWeekRangeFromToday();
$weekRangeContainer.innerText = `${
  start.getMonth() + 1
}월 ${start.getDate()}일부터 ${end.getMonth() + 1}월 ${end.getDate()}일까지🗓`;

/** 근무표 초기화 버튼 이벤트 */
export const resetScheduleEvent = () => {
  $resetScheduleButton.addEventListener('click', async () => {
    if (!confirm('근무표를 초기화하시겠습니까?')) return;
    await resetSchedule();
    resetSelectedDays();
    $workdayContainer
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => checkbox.checked && (checkbox.checked = false));
    $laundryContainer
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => checkbox.checked && (checkbox.checked = false));
    renderSchedule();
  });
};

/** 복사 버튼 이벤트 */
export const copyScheduleEvent = () => {
  $copyButton.addEventListener('click', () => {
    let textToCopy = $scheduleDisplayContainer.innerText;
    textToCopy = textToCopy.replace(/\n{3,}/g, '\n\n');

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        $copyButton.innerText = '복사됨';

        setTimeout(() => {
          $copyButton.innerText = '복사';
        }, 500);
      })
      .catch((err) => {
        alert('복사 실패');
        console.error('복사 실패:', err);
      });
  });
};
