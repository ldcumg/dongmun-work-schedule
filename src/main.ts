import { onValue, DataSnapshot } from 'firebase/database';
import { scheduleRef } from './firebase';
import { loadSavedName } from './features/name';
import { syncSelectedDaysFromData, renderSchedule } from './features/schedule';
import {
  setNameEvent,
  handleSubmitEvent,
  resetScheduleEvent,
  copyScheduleEvent,
  renderWeekRange,
} from './dom/events';

window.addEventListener('DOMContentLoaded', () => {
  let isInitial = true;

  onValue(scheduleRef(), (snapshot: DataSnapshot) => {
    const scheduleData = snapshot.val();

    if (isInitial) {
      syncSelectedDaysFromData(scheduleData);
      isInitial = false;
    }
    renderSchedule(scheduleData);
  });

  loadSavedName();
  setNameEvent();
  handleSubmitEvent();
  resetScheduleEvent();
  renderWeekRange();
  copyScheduleEvent();
});
