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
import {
  createApplyWorkContainer,
  createStaffSelectContainer,
} from './dom/elements';
import { fetchStaffs } from './api';
import { getSavedStaff } from './feature/staff';

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
  let savedStaff = getSavedStaff();
  const staffs = await fetchStaffs();

  if (savedStaff) {
    const applyWorkContainer = await createApplyWorkContainer(
      savedStaff.name,
      savedStaff.docId
    );
    selectSection.appendChild(applyWorkContainer);
  } else {
    const staffSelectContainer = await createStaffSelectContainer(staffs);
    selectSection.appendChild(staffSelectContainer);
  }
  renderWeekRange(weekRangeContainer);
  renderTotalWorkDays(cumulationContainer, staffs);

  delegateStaffEvents(selectSection);
  delegateSubmitEvents(selectSection);

  bindResetScheduleEvent(resetScheduleButton);
  bindCopyScheduleEvent(copyButton, scheduleDisplay);

  onValue(scheduleRef(), async (snapshot: DataSnapshot) => {
    const scheduleData = snapshot.val();
    renderSchedule(scheduleContainer, numberWorkContainer, scheduleData);
    init ? (init = false) : (savedStaff = getSavedStaff());
    savedStaff &&
      (syncSelectedDays(savedStaff.name, scheduleData), renderCheckboxes());
  });
});
