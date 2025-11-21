import { WEEKDAYS } from './constants';
import type { ScheduleData, SelectedDaysKey, Weekday } from './types';

export function getElement<T extends HTMLElement>(
  selector: string,
  type: new () => T
): T {
  const el = document.querySelector(selector);
  if (!(el instanceof type))
    throw new Error(`${selector} 요소를 찾을 수 없습니다`);

  return el;
}

export function createSvgPath(fileName: string) {
  return `/assets/icons/${fileName}.svg`;
}

export function clearStaffButtonClasses(
  buttons: NodeListOf<HTMLInputElement>,
  ...classes: string[]
) {
  buttons.forEach((btn) => classes.forEach((cls) => btn.classList.remove(cls)));
}

export function toggleStaffButtonClass(
  buttons: NodeListOf<HTMLInputElement>,
  className: string,
  condition: boolean
) {
  buttons.forEach((btn) => {
    if (condition) btn.classList.add(className);
    else btn.classList.remove(className);
  });
}

export function isWeekday(v: string | undefined): v is Weekday {
  if (!v) return false;
  return (WEEKDAYS as readonly string[]).includes(v);
}

function getWeekRange(baseMonday: Date) {
  const monday = new Date(baseMonday);
  const sunday = new Date(baseMonday);
  sunday.setDate(baseMonday.getDate() + 6);
  return [monday, sunday] as const;
}

export function getSmartWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0: 일요일
  const date = now.getDate();

  // 이번 주 월요일 구하기
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const thisWeekMonday = new Date(now);
  thisWeekMonday.setDate(date + diffToMonday);

  // 다음 주 월요일
  const nextWeekMonday = new Date(thisWeekMonday);
  nextWeekMonday.setDate(thisWeekMonday.getDate() + 7);

  // 지금이 "일요일 16:00 이후"인지 체크
  const isAfterSunday4PM = (() => {
    const sunday = new Date(thisWeekMonday);
    sunday.setDate(thisWeekMonday.getDate() + 6);
    sunday.setHours(16, 0, 0, 0);
    return now >= sunday;
  })();

  return isAfterSunday4PM
    ? getWeekRange(nextWeekMonday) // 다음 주
    : getWeekRange(thisWeekMonday); // 이번 주
}

export function getPeopleForDay(
  scheduleData: ScheduleData,
  category: SelectedDaysKey,
  day: Weekday
) {
  const people = [];
  for (let name in scheduleData) {
    if (!scheduleData.hasOwnProperty(name)) continue;
    if (scheduleData[name][category]?.includes(day)) people.push(name);
  }
  return people;
}
