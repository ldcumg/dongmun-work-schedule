import { WEEKDAYS } from './constants.js';
import { selectedWorkDays, selectedLaundryDays } from './schedule.js';
import { $workdayContainer, $laundryContainer } from './domElements.js';

const createCheckbox = (day, selectedDays) => {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = day;
  checkbox.name = day;
  checkbox.checked = selectedDays.has(day);
  label.append(checkbox, day);
  return { label, checkbox };
};

export const renderCheckboxes = () => {
  const workFrag = document.createDocumentFragment();
  const laundryFrag = document.createDocumentFragment();

  WEEKDAYS.forEach((day) => {
    const { label: workLabel, checkbox: workCheckbox } = createCheckbox(
      day,
      selectedWorkDays
    );
    const { label: laundryLabel, checkbox: laundryCheckbox } = createCheckbox(
      day,
      selectedLaundryDays
    );

    laundryCheckbox.disabled = !selectedWorkDays.has(day);

    workCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) selectedWorkDays.add(day);
      else selectedWorkDays.delete(day);

      laundryCheckbox.disabled = !e.target.checked;
      if (!e.target.checked) {
        laundryCheckbox.checked = false;
        selectedLaundryDays.delete(day);
      }
    });

    laundryCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) selectedLaundryDays.add(day);
      else selectedLaundryDays.delete(day);
    });

    workFrag.appendChild(workLabel);
    laundryFrag.appendChild(laundryLabel);
  });

  $workdayContainer.appendChild(workFrag);
  $laundryContainer.appendChild(laundryFrag);
};
