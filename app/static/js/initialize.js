import { fetchSchedule } from './apis.js';
import { loadSavedName } from './name.js';
import { syncSelectedDaysFromData, renderSchedule } from './schedule.js';
import { renderCheckboxes } from './weekdays.js';

const initialize = async () => {
  const scheduleData = await fetchSchedule();
  loadSavedName();
  syncSelectedDaysFromData(scheduleData);
  renderCheckboxes();
  renderSchedule(scheduleData);
};

window.addEventListener('DOMContentLoaded', initialize);
