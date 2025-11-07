import { $nameInput } from './dom/elements.js';
import { STAFF_NAME } from './constants.js';

const $nameButton = document.querySelector('#name-button');

export const lsSavedName = localStorage.getItem(STAFF_NAME);

export const setEditingState = (isEditing) => {
  $nameInput.disabled = !isEditing;
  $nameButton.textContent = isEditing ? '저장' : '수정';
  if (isEditing) $nameInput.focus();
};

export const loadLsSavedName = () => {
  if (lsSavedName) {
    $nameInput.value = lsSavedName;
    setEditingState(false);
  } else {
    setEditingState(true);
  }
};

export const saveLsName = () => {
  const name = $nameInput.value.trim();
  if (!name) return;
  localStorage.setItem(STAFF_NAME, name);
  setEditingState(false);
};
