import { STAFF } from './constants';

export const saveStaff = (name: string, docId: string) =>
  localStorage.setItem(STAFF, JSON.stringify({ name, docId }));

export const getSavedStaff = () => {
  const staffData = localStorage.getItem(STAFF);
  return staffData ? JSON.parse(staffData) : null;
};

export const removeSavedStaff = () => localStorage.removeItem(STAFF);
