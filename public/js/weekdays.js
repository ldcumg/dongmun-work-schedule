export const createCheckbox = (day, selectedDays) => {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = day;
  checkbox.name = day;
  checkbox.checked = selectedDays.has(day);
  label.append(checkbox, day);
  return { label, checkbox };
};
