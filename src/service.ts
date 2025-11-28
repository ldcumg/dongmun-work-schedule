import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { staffDoc } from './firebase';
import { NEWBIE } from './constants';
import { createEl } from './utils';

/** DB에 신입 추가 */
const dbAddNewbie = async (staffContainer: HTMLDivElement, docId: string) => {
  const duplicates = Array.from(
    staffContainer.querySelectorAll<HTMLButtonElement>('.staff-button')
  ).filter((btn) => btn.textContent.startsWith(NEWBIE)).length;
  const name = duplicates > 0 ? `${NEWBIE}${duplicates + 1}` : NEWBIE;

  await setDoc(staffDoc(docId), { name, workDays: {} });
  return name;
};

export const attachNewbie = async (staffContainer: HTMLDivElement) => {
  const docId = new Date().getTime().toString();
  const name = await dbAddNewbie(staffContainer, docId);
  const staffButton = createEl('button', {
    type: 'button',
    className: 'staff-button',
    textContent: name,
    dataset: { docId },
  });
  staffContainer.appendChild(staffButton);
};

export const editStaff = async (targetId: string, newName: string) => {
  await updateDoc(staffDoc(targetId), { name: newName });
};

export const removeStaffByName = async (targetId: string) => {
  await deleteDoc(staffDoc(targetId));
};
