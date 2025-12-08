import { push, set, update, remove } from 'firebase/database';
import { scheduleRef, staffRef } from './firebase';
import { rootRef } from './firebase';
import { getScheduleData, getSelectedDays } from './store';
import { Firebase, SelectedDays } from './constants';
import { getWeekKey } from './utils';

/** 신입 추가 */
export const addNewbie = async (name: string) =>
  await set(push(staffRef()), { name });

/** staff 이름 변경 */
export const changeStaffName = async (staffKey: string, newName: string) =>
  await update(staffRef(staffKey), { name: newName });

/** schedule 이름 변경 */
export const changeScheduleName = async (
  targetName: string,
  newName: string
) => {
  const scheduleData = getScheduleData();

  if (Object.keys(scheduleData).includes(targetName)) {
    await set(scheduleRef(newName), scheduleData[targetName]);
    await remove(scheduleRef(targetName));
  }
};

/** staff 삭제 */
export const removeStaff = async (staffKey: string) =>
  await remove(staffRef(staffKey));

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
