import { onValue, DataSnapshot } from 'firebase/database';
import { scheduleRef } from './firebase';
import { loadLsSavedName } from './name';
import { syncSelectedDaysFromData, renderSchedule } from './schedule';
import {
  setNameEvent,
  handleSubmitEvent,
  resetScheduleEvent,
  copyScheduleEvent,
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

  loadLsSavedName();
  setNameEvent();
  handleSubmitEvent();
  resetScheduleEvent();
  copyScheduleEvent();
});
