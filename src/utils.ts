import { NEWBIE, WEEKDAYS } from './constants';
import { getStaffData } from './store';
import type { ScheduleData, SelectedDaysKey, Weekday } from './types';

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: Partial<HTMLElementTagNameMap[K]> & {
    dataset?: Record<string, string>;
    events?: Record<string, EventListenerOrEventListenerObject>;
  }
) {
  const el = document.createElement(tag);

  if (options) {
    const { dataset, events, ...rest } = options;

    Object.assign(el, rest);

    if (dataset) {
      for (const key in dataset) {
        el.dataset[key] = dataset[key];
      }
    }

    if (events) {
      for (const key in events) {
        el.addEventListener(key, events[key]);
      }
    }
  }

  return el;
}

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

async function createSvgIcon(path: string) {
  const response = await fetch(path);
  const svgText = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return null;

  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('fill', 'currentColor');

  return svg;
}

export async function appendSvgIcons(container: HTMLElement, paths: string[]) {
  const results = await Promise.allSettled(paths.map(createSvgIcon));
  results.forEach((res) => {
    if (res.status === 'fulfilled' && res.value)
      container.appendChild(res.value);
  });
}

export function clearStaffButtonClasses(
  buttons: NodeListOf<HTMLButtonElement>,
  ...classes: string[]
) {
  buttons.forEach((btn) => classes.forEach((cls) => btn.classList.remove(cls)));
}

export function toggleStaffButtonClass(
  buttons: NodeListOf<HTMLButtonElement>,
  className: string,
  condition: boolean
) {
  buttons.forEach((btn) => {
    if (condition) btn.classList.add(className);
    else btn.classList.remove(className);
  });
}

export function generateNewbieName() {
  const staffs = getStaffData();

  const duplicates = staffs.filter((staff) =>
    staff.name.startsWith(NEWBIE)
  ).length;

  return duplicates > 0 ? `${NEWBIE}${duplicates + 1}` : NEWBIE;
}

export function isWeekday(v: string | undefined): v is Weekday {
  if (!v) return false;
  return (WEEKDAYS as readonly string[]).includes(v);
}

/** 이번 주 월요일 구하기 */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0: 일요일
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 일요일 14시 이후인지 체크 */
function isAfterSunday2PM(date: Date): boolean {
  const monday = getMonday(date);
  const sunday2PM = new Date(monday);
  sunday2PM.setDate(monday.getDate() + 6);
  sunday2PM.setHours(14, 0, 0, 0);
  return date >= sunday2PM;
}

/** 주간 범위 반환 */
function getWeekRange(baseMonday: Date): [Date, Date] {
  const monday = new Date(baseMonday);
  const sunday = new Date(baseMonday);
  sunday.setDate(baseMonday.getDate() + 6);
  return [monday, sunday];
}

/** 일요일 14시를 기준으로 주간 범위 반환 */
export function getSmartWeekRange(): [Date, Date] {
  const date = new Date();
  const thisWeekMonday = getMonday(date);
  const nextWeekMonday = new Date(thisWeekMonday);
  nextWeekMonday.setDate(thisWeekMonday.getDate() + 7);

  return isAfterSunday2PM(date)
    ? getWeekRange(nextWeekMonday) // 다음 주
    : getWeekRange(thisWeekMonday); // 이번 주
}

/**
 * 주차 키 반환
 * @example "2025-W47"
 *  */
export function getWeekKey(): string {
  // Smart Week를 기준으로 계산
  const [weekMonday] = getSmartWeekRange();
  const tempDate = new Date(weekMonday.getTime());

  // ISO 주차 계산
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  const year = tempDate.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);

  const week = Math.ceil(
    ((tempDate.getTime() - firstDayOfYear.getTime()) / 86400000 + 1) / 7
  );

  return `${year}-W${week}`;
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
