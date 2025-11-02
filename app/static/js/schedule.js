import { WEEKDAYS } from './constants.js';
import { savedName } from './name.js';
import { fetchSchedule, resetSchedule } from './apis.js';
import { getNextWeekRangeFromToday, getPeopleForDay } from './utils.js';
import { $workdayContainer, $laundryContainer } from './domElements.js';

const $weekRangeContainer = document.querySelector('#week-range-container');
const $scheduleContainer = document.querySelector('#schedule-container');
const $numberWorkContainer = document.querySelector('#work-number-container');
const $resetScheduleButton = document.querySelector('#reset-schedule-button');
const $scheduleDisplayContainer = document.getElementById('schedule-display');
const $copyButton = document.getElementById('copy-button');

export const selectedWorkDays = new Set();
export const selectedLaundryDays = new Set();

/** 선택된 날들을 스케줄 데이터에서 동기화 */
export const syncSelectedDaysFromData = (scheduleData) => {
  const data = scheduleData[savedName];
  if (!data) return;

  data.work.forEach((day) => selectedWorkDays.add(day));
  data.laundry.forEach((day) => selectedLaundryDays.add(day));
};

/** 이번주 근무 기간 렌더링 */
const [start, end] = getNextWeekRangeFromToday();
$weekRangeContainer.innerText = `${
  start.getMonth() + 1
}월 ${start.getDate()}일부터 ${end.getMonth() + 1}월 ${end.getDate()}일까지🗓`;

/** 근무 스케줄 렌더링 */
export const renderSchedule = async (scheduleData) => {
  scheduleData ||= await fetchSchedule();

  $scheduleContainer.innerText = WEEKDAYS.map((day) => {
    const work = getPeopleForDay(scheduleData, 'work', day);
    const laundry = getPeopleForDay(scheduleData, 'laundry', day);
    return `${day} ${work.join(' ')} / ${laundry.join(' ')}`;
  }).join('\n');

  const numberOfWorkData = {};
  for (const name in scheduleData) {
    if (!scheduleData.hasOwnProperty(name)) continue;
    const workDays = scheduleData[name].work.length;
    (numberOfWorkData[workDays] ??= new Set()).add(name);
  }

  $numberWorkContainer.innerText = Object.keys(numberOfWorkData)
    .sort((a, b) => b - a)
    .map((days) => `${[...numberOfWorkData[days]].join(' ')} ${days}일`)
    .join('\n');
};

// 근무표 초기화 버튼 이벤트
$resetScheduleButton.addEventListener('click', async () => {
  if (!confirm('근무표를 초기화하시겠습니까?')) return;
  await resetSchedule();
  selectedWorkDays.clear();
  selectedLaundryDays.clear();
  $workdayContainer
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkbox) => checkbox.checked && (checkbox.checked = false));
  $laundryContainer
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkbox) => checkbox.checked && (checkbox.checked = false));
  renderSchedule();
});

// 복사 버튼 이벤트
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
