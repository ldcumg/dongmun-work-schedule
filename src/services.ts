import { ScheduleData } from './types';
import { push, set, update } from 'firebase/database';
import { staffRef } from './firebase';
import { rootRef } from './firebase';
import { getScheduleData, getSelectedDays } from './store';
import { Firebase, SelectedDays } from './constants';
import { getWeekKey } from './utils';

/** 신입 추가 */
export const addNewbie = async (name: string) =>
  await set(push(staffRef()), { name });

/** staff 이름 변경 */
export const changeStaffName = async (
  staffKey: string,
  targetName: string,
  newName: string
) => {
  const scheduleData = getScheduleData();
  const updates: Record<string, unknown> = {
    [`staff/${staffKey}/name`]: newName,
  };
  if (scheduleData[targetName]) {
    updates[`schedule/${newName}`] = scheduleData[targetName];
    updates[`schedule/${targetName}`] = null;
  }

  await update(rootRef, updates);
};

/** staff 삭제 */
export const removeStaff = async (
  staffKey: string,
  targetName: string,
  scheduleData: ScheduleData
) => {
  const updates: Record<string, unknown> = {
    [`staff/${staffKey}`]: null,
  };
  scheduleData[targetName] && (updates[`schedule/${targetName}`] = null);

  await update(rootRef, updates);
};

/** 근무 제출 */
export const submitSelectedDays = async (name: string, staffKey: string) => {
  try {
    const selectedWorkDays = getSelectedDays(SelectedDays.WORK);
    const weekKey = getWeekKey();

    await update(rootRef, {
      [`${Firebase.SCHEDULE}/${name}`]: {
        work: [...selectedWorkDays],
        laundry: [...getSelectedDays(SelectedDays.LAUNDRY)],
      },
      [`${Firebase.STAFF}/${staffKey}/workDays/${weekKey}`]:
        selectedWorkDays.size,
    });
  } catch (err) {
    alert('스케줄 제출 중 오류가 발생했습니다.');
    console.error(err);
    throw err;
  }
};
