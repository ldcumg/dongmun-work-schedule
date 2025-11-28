import { createSvgPath } from './utils';

export const WEEKDAYS = Object.freeze([
  '월',
  '화',
  '수',
  '목',
  '금',
  '토',
  '일',
] as const);

export const SVG_ICON_PATH = Object.freeze({
  check: createSvgPath('check'),
  plus: createSvgPath('plus'),
  edit: createSvgPath('edit'),
  trash: createSvgPath('trash'),
  x: createSvgPath('circle-x'),
} as const);

export enum SelectedDays {
  WORK = 'work',
  LAUNDRY = 'laundry',
}

export enum Firebase {
  STAFF = 'staff',
  NAME = 'name',
  SCHEDULE = 'schedule',
}
export const STAFF = 'staff' as const;

export const NEWBIE = '신입';
