import { $nameInput } from './dom/elements';
import { STAFF_NAME } from './constants';

const $nameButton = document.querySelector('#name-button');

export const getSavedName = () => localStorage.getItem(STAFF_NAME);

export const setEditingState = (isEditing: boolean) => {
  if ($nameInput instanceof HTMLInputElement) {
    $nameInput.disabled = !isEditing;
    isEditing && $nameInput.focus();
  }
  if ($nameButton instanceof HTMLButtonElement)
    $nameButton.textContent = isEditing ? '저장' : '수정';
};

export const loadLsSavedName = () => {
  const savedName = getSavedName();
  if (savedName && $nameInput instanceof HTMLInputElement) {
    $nameInput.value = savedName;
    setEditingState(false);
  } else {
    setEditingState(true);
  }
};

export const saveLsName = () => {
  if ($nameInput instanceof HTMLInputElement) {
    const name = $nameInput.value.trim();
    if (!name) return;
    localStorage.setItem(STAFF_NAME, name);
  }
  setEditingState(false);
};
