import { $nameInput } from './domElements.js';
import { STAFF_NAME_KEY } from './constants.js';

const $nameForm = document.querySelector('#name-form');
const $nameButton = document.querySelector('#name-button');

export const savedName = localStorage.getItem(STAFF_NAME_KEY);

const setEditingState = (isEditing) => {
  $nameInput.disabled = !isEditing;
  $nameButton.textContent = isEditing ? '저장' : '수정';
  if (isEditing) $nameInput.focus();
};

export const loadSavedName = () => {
  if (savedName) {
    $nameInput.value = savedName;
    setEditingState(false);
  } else {
    setEditingState(true);
  }
};

export const saveName = () => {
  const name = $nameInput.value.trim();
  if (!name) return;
  localStorage.setItem(STAFF_NAME_KEY, name);
  setEditingState(false);
};

$nameForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if ($nameInput.disabled) {
    // $nameInput.value = '';
    setEditingState(true);
  } else {
    saveName();
  }
});
