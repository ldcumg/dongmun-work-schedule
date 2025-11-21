import { onValue, DataSnapshot } from 'firebase/database';
import { scheduleRef } from './firebase';
import { syncSelectedDays } from './feature/schedule';
import {
  delegateStaffEvents,
  delegateSubmitEvents,
  bindResetScheduleEvent,
  bindCopyScheduleEvent,
} from './dom/events';
import {
  renderCheckboxes,
  renderSchedule,
  renderWeekRange,
} from './dom/render';
import { initUI } from './dom/init';
import { getSavedName } from './feature/name';
import { getElement } from './utils';
import {
  createApplyWorkContainer,
  createStaffSelectContainer,
} from './dom/elements';

window.addEventListener('DOMContentLoaded', () => {
  const {
    selectSection,
    scheduleDisplay,
    weekRangeContainer,
    scheduleContainer,
    resetScheduleButton,
    numberWorkContainer,
    copyButton,
  } = initUI();

  const savedName = getSavedName();

  onValue(scheduleRef(), (snapshot: DataSnapshot) => {
    const scheduleData = snapshot.val();
    renderSchedule(scheduleContainer, numberWorkContainer, scheduleData);
    if (savedName) {
      const workDayContainer = getElement('#workday-container', HTMLDivElement);
      const laundryContainer = getElement('#laundry-container', HTMLDivElement);
      syncSelectedDays(savedName, scheduleData);
      renderCheckboxes(workDayContainer, laundryContainer);
    }
  });
  if (savedName) {
    selectSection.appendChild(createApplyWorkContainer(savedName));
  } else {
    createStaffSelectContainer().then((el) => selectSection.appendChild(el));
  }
  renderWeekRange(weekRangeContainer);

  delegateStaffEvents(selectSection);
  delegateSubmitEvents(selectSection);

  bindResetScheduleEvent(resetScheduleButton);
  bindCopyScheduleEvent(copyButton, scheduleDisplay);
});
