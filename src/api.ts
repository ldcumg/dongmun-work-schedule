import { doc, getDocs, updateDoc } from 'firebase/firestore';
import { update, remove } from 'firebase/database';
import { db, scheduleRef, staffCollection } from './firebase';
import { getSelectedDays } from './store';
import { Firebase, SelectedDaysKey } from './constants';
import { operateStaffByName } from './feature/staff';
import { getWeekKey } from './utils';

export const fetchStaffs = async () =>
  (await getDocs(staffCollection)).docs.map((doc) => doc.data());

/** 근무 제출 */
export const submitSelectedDays = async (name: string) => {
  try {
    const selectedWorkDays = getSelectedDays(SelectedDaysKey.WORK);
    await update(scheduleRef(name), {
      work: [...selectedWorkDays],
      laundry: [...getSelectedDays(SelectedDaysKey.LAUNDRY)],
    });
    const weekKey = getWeekKey();
    await operateStaffByName(name, (docId) =>
      updateDoc(doc(db, Firebase.STAFF, docId), {
        [`workDays.${weekKey}`]: selectedWorkDays.size,
      })
    );
  } catch (err) {
    alert('스케줄 제출 중 오류가 발생했습니다.');
    console.error(err);
    throw err;
  }
};

/** 근무표 초기화 */
export const resetSchedule = async () => {
  try {
    await remove(scheduleRef());
  } catch (err) {
    alert('근무표 초기화 중 오류가 발생했습니다.');
    console.error(err);
    throw err;
  }
};
