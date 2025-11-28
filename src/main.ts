import { onValue, DataSnapshot } from 'firebase/database';
import { scheduleRef } from './firebase';
import {
  delegateStaffEvents,
  delegateSubmitEvents,
  bindCopyScheduleEvent,
} from './dom/events';
import {
  renderSchedule,
  renderTotalWorkDays,
  renderWeekRange,
} from './dom/render';
import { initUI } from './dom/init';
import {
  createApplyWorkChildren,
  createStaffSelectChildren,
} from './dom/elements';
import { fetchStaffs } from './api';
import { setScheduleData } from './store';
import { getSavedStaff } from './localStorage';
import { createElement } from './utils';
import { createModal } from './modal';

window.addEventListener('DOMContentLoaded', async () => {
  const {
    selectSection,
    scheduleDisplay,
    weekRangeContainer,
    scheduleContainer,
    numberWorkContainer,
    cumulationContainer,
    copyButton,
  } = initUI();

  let init = true;
  const savedStaff = getSavedStaff();
  let staffs = await fetchStaffs();

  if (!savedStaff) {
    const staffSelectChildren = await createStaffSelectChildren(staffs);
    selectSection.append(...staffSelectChildren);
  }

  renderWeekRange(weekRangeContainer);
  renderTotalWorkDays(cumulationContainer, staffs);

  delegateStaffEvents(selectSection);
  delegateSubmitEvents(selectSection);

  bindCopyScheduleEvent(copyButton, scheduleDisplay);

  onValue(scheduleRef(), async (snapshot: DataSnapshot) => {
    const scheduleData = snapshot.val();
    setScheduleData(scheduleData);
    renderSchedule(scheduleContainer, numberWorkContainer, scheduleData);
    init || (staffs = await fetchStaffs());
    renderTotalWorkDays(cumulationContainer, staffs);
    if (init && savedStaff) {
      const applyWorkChildren = createApplyWorkChildren(
        savedStaff.name,
        savedStaff.docId,
        scheduleData
      );
      selectSection.append(...applyWorkChildren);
    }
    init && (init = false);
  });

  const isIos = /iPhone|iPad/.test(navigator.userAgent);
  const isInStandalone =
    'standalone' in window.navigator && window.navigator.standalone;
  if (!savedStaff && isIos && !isInStandalone) {
    const iosInstallTip = createElement('p', {
      id: 'ios-install-tip',
      textContent:
        "설치하려면 '공유 → 홈 화면에 추가' 를 선택하세요.",
    });
    createModal(iosInstallTip);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    if (!savedStaff) {
      const deferredPrompt = e;
      const installBtn = createElement('button', {
        type: 'button',
        id: 'install-btn',
        textContent: '설치',
      });
      const closeModal = createModal(installBtn);

      installBtn.addEventListener('click', async () => {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        closeModal();
      });
    }
  });
});
