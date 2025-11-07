import { onValue } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js';
import { scheduleRef } from './firebase.js';
import { loadLsSavedName } from './name.js';
import { syncSelectedDaysFromData, renderSchedule } from './schedule.js';
import {
  setNameEvent,
  handleSubmitEvent,
  resetScheduleEvent,
  copyScheduleEvent,
} from './dom/events.js';

window.addEventListener('DOMContentLoaded', () => {
  let isInitial = true;

  onValue(scheduleRef(), (snapshot) => {
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
