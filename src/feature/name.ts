import { STAFF_NAME } from '../constants';

export const saveName = (name: string) =>
  localStorage.setItem(STAFF_NAME, name);

export const getSavedName = () => localStorage.getItem(STAFF_NAME);

export const clearSavedName = () => localStorage.removeItem(STAFF_NAME);
