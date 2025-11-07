import {
  update,
  remove,
} from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js';
import { scheduleRef } from './firebase.js';
import { SCHEDULE } from './constants.js';

/** 근무 제출 */
export const submitSelectedDays = async (name, selectedDays) => {
  try {
    await update(scheduleRef(name), { ...selectedDays });
  } catch (err) {
    alert('스케줄 제출 중 오류가 발생했습니다.');
    console.error(err);
    throw err;
  }
};

/** 근무표 초기화 */
export const resetSchedule = async () => {
  try {
    await remove(scheduleRef(), SCHEDULE);
  } catch (err) {
    alert('근무표 초기화 중 오류가 발생했습니다.');
    console.error(err);
    throw err;
  }
};
