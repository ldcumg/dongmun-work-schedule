import { $nameInput } from '../dom/elements';
import { STAFF_NAME } from '../constants';

const $name = document.querySelector('#name');
const $nameButton = document.querySelector('#name-select-button');

export const getSavedName = () => localStorage.getItem(STAFF_NAME);

export const setEditingState = (isEditing: boolean) => {
  if ($nameInput instanceof HTMLInputElement) {
    $nameInput.disabled = !isEditing;
    isEditing && $nameInput.focus();
  }
  if ($nameButton instanceof HTMLButtonElement)
    $nameButton.textContent = isEditing ? '저장' : '수정';
};

export const loadSavedName = () => {
  const savedName = getSavedName();
  if ($name instanceof HTMLSpanElement && savedName)
    $name.textContent = savedName;
};

export const saveName = () => {
  if ($nameInput instanceof HTMLInputElement) {
    const name = $nameInput.value.trim();
    if (!name) return;
    localStorage.setItem(STAFF_NAME, name);
  }
  setEditingState(false);
};
