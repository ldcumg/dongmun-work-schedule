import { getDocs, updateDoc } from 'firebase/firestore';
import { update } from 'firebase/database';
import { scheduleRef, staffCollection, staffDoc } from './firebase';
import { getSelectedDays } from './store';
import { SelectedDays } from './constants';
import { getWeekKey } from './utils';

export const fetchStaffs = async () =>
  (await getDocs(staffCollection)).docs.map((doc) => ({
    ...doc.data(),
    docId: doc.id,
  }));

/** 근무 제출 */
export const submitSelectedDays = async (name: string, docId: string) => {
  try {
    const selectedWorkDays = getSelectedDays(SelectedDays.WORK);
    const weekKey = getWeekKey();
    await updateDoc(staffDoc(docId), {
      [`workDays.${weekKey}`]: selectedWorkDays.size,
    });
    await update(scheduleRef(name), {
      work: [...selectedWorkDays],
      laundry: [...getSelectedDays(SelectedDays.LAUNDRY)],
    });
  } catch (err) {
    alert('스케줄 제출 중 오류가 발생했습니다.');
    console.error(err);
    throw err;
  }
};
