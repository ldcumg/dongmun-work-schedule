import { getElement } from '../utils';

export const initUI = () => ({
  selectSection: getElement('#select-section', HTMLElement),
  scheduleDisplay: getElement('#schedule-display', HTMLDivElement),
  scheduleContainer: getElement('#schedule-container', HTMLDivElement),
  resetScheduleButton: getElement('#reset-schedule-button', HTMLInputElement),
  weekRangeContainer: getElement('#week-range-container', HTMLDivElement),
  numberWorkContainer: getElement('#work-number-container', HTMLDivElement),
  copyButton: getElement('#copy-button', HTMLInputElement),
});
