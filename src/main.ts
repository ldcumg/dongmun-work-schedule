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
  renderTotalWorkDays,
  renderWeekRange,
} from './dom/render';
import { initUI } from './dom/init';
import { getSavedName } from './feature/name';
import {
  createApplyWorkContainer,
  createStaffSelectContainer,
} from './dom/elements';
import { fetchStaffs } from './api';

window.addEventListener('DOMContentLoaded', async () => {
  const {
    selectSection,
    scheduleDisplay,
    weekRangeContainer,
    scheduleContainer,
    resetScheduleButton,
    numberWorkContainer,
    cumulationContainer,
    copyButton,
  } = initUI();

  let init = true;
  let savedName = getSavedName();
  let staffs = await fetchStaffs();

  if (savedName) {
    const applyWorkContainer = await createApplyWorkContainer(savedName);
    selectSection.appendChild(applyWorkContainer);
  } else {
    const staffSelectContainer = await createStaffSelectContainer(staffs);
    selectSection.appendChild(staffSelectContainer);
  }
  renderWeekRange(weekRangeContainer);

  delegateStaffEvents(selectSection);
  delegateSubmitEvents(selectSection);

  bindResetScheduleEvent(resetScheduleButton);
  bindCopyScheduleEvent(copyButton, scheduleDisplay);

  onValue(scheduleRef(), async (snapshot: DataSnapshot) => {
    const scheduleData = snapshot.val();
    renderSchedule(scheduleContainer, numberWorkContainer, scheduleData);
    if (init) {
      init = false;
    } else {
      staffs = await fetchStaffs();
      savedName = getSavedName();
    }
    renderTotalWorkDays(cumulationContainer, staffs);
    if (savedName) {
      syncSelectedDays(savedName, scheduleData);
      renderCheckboxes();
    }
  });
});
