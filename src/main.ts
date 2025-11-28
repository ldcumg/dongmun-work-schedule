import { onValue, DataSnapshot } from 'firebase/database';
import { scheduleRef } from './firebase';
import {
  delegateStaffEvents,
  delegateSubmitEvents,
  bindCopyScheduleEvent,
} from './dom/events';
import {
  renderSchedule,
  renderTotalWorkDays,
  renderWeekRange,
} from './dom/render';
import { initUI } from './dom/init';
import {
  createApplyWorkChildren,
  createStaffSelectChildren,
} from './dom/elements';
import { fetchStaffs } from './api';
import { getSavedStaff } from './feature/staff';
import { setScheduleData } from './store';

window.addEventListener('DOMContentLoaded', async () => {
  const {
    selectSection,
    scheduleDisplay,
    weekRangeContainer,
    scheduleContainer,
    numberWorkContainer,
    cumulationContainer,
    copyButton,
  } = initUI();

  let init = true;
  const savedStaff = getSavedStaff();
  let staffs = await fetchStaffs();

  if (!savedStaff) {
    const staffSelectChildren = await createStaffSelectChildren(staffs);
    selectSection.append(...staffSelectChildren);
  }

  renderWeekRange(weekRangeContainer);
  renderTotalWorkDays(cumulationContainer, staffs);

  delegateStaffEvents(selectSection);
  delegateSubmitEvents(selectSection);

  bindCopyScheduleEvent(copyButton, scheduleDisplay);

  onValue(scheduleRef(), async (snapshot: DataSnapshot) => {
    const scheduleData = snapshot.val();
    setScheduleData(scheduleData);
    renderSchedule(scheduleContainer, numberWorkContainer, scheduleData);
    init || (staffs = await fetchStaffs());
    console.log('[ ㏒ ] staffs =>', staffs);
    renderTotalWorkDays(cumulationContainer, staffs);
    if (init && savedStaff) {
      const applyWorkChildren = createApplyWorkChildren(
        savedStaff.name,
        savedStaff.docId,
        scheduleData
      );
      selectSection.append(...applyWorkChildren);
    }
    init && (init = false);
  });
});
