import {
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, staffCollection } from '../firebase';
import { Firebase, NEWBIE } from '../constants';
import { createEl } from '../utils';

/** DB에 신입 추가 */
const dbAddNewbie = async (staffContainer: HTMLDivElement) => {
  const duplicates = Array.from(
    staffContainer.querySelectorAll<HTMLButtonElement>('.staff-button')
  ).filter((btn) => btn.textContent.startsWith(NEWBIE)).length;

  const name = duplicates > 0 ? `${NEWBIE}${duplicates + 1}` : NEWBIE;
  await setDoc(doc(staffCollection), { name, workDays: {} });
  return name;
};

export const attachNewbie = async (staffContainer: HTMLDivElement) => {
  const name = await dbAddNewbie(staffContainer);
  const staffButton = createEl('button', {
    type: 'button',
    className: 'staff-button',
    id: name,
    textContent: name,
  });
  staffContainer.appendChild(staffButton);
};

export const operateStaffByName = async (
  name: string,
  callback: (docSnapId: string) => Promise<void>
) => {
  const q = query(staffCollection, where(Firebase.NAME, '==', name));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    alert('대상 스탭이 없습니다.');
    return;
  }
  await Promise.allSettled(
    snapshot.docs.map((docSnap) => callback(docSnap.id))
  );
};

export const editStaff = async (
  targetName: string,
  newName: string,
  target: HTMLButtonElement
) => {
  await operateStaffByName(targetName, (docId) =>
    updateDoc(doc(db, Firebase.STAFF, docId), { name: newName })
  );
  target.value = newName;
};

export const removeStaffByName = async (
  targetName: string,
  target: HTMLButtonElement
) => {
  await operateStaffByName(targetName, (docId) =>
    deleteDoc(doc(db, Firebase.STAFF, docId))
  );
  target.remove();
};
