import { onValue, DataSnapshot } from 'firebase/database';
import { rootRef } from './firebase';
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
import { renderApplySection, renderStaffSection } from './dom/render';
import { setScheduleData, setStaffData, syncSelectedDays } from './store';
import { getSavedStaff } from './localStorage';
import { createElement } from './utils';
import { createModal } from './modal';
import type { ScheduleData, StaffResponse } from './types';

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
  let savedStaff = getSavedStaff();

  renderWeekRange(weekRangeContainer);

  delegateStaffEvents(selectSection);
  delegateSubmitEvents(selectSection);

  bindCopyScheduleEvent(copyButton, scheduleDisplay);

  onValue(rootRef, (snapshot: DataSnapshot) => {
    const {
      staff,
      schedule,
    }: { staff: StaffResponse; schedule: ScheduleData } = snapshot.val();
    const staffArray = Object.entries(staff).map(([staffKey, staffData]) => ({
      staffKey,
      ...staffData,
    }));

    setStaffData(staffArray);
    setScheduleData(schedule);

    savedStaff && init
      ? syncSelectedDays(savedStaff.name, schedule)
      : (savedStaff = getSavedStaff());

    renderSchedule(scheduleContainer, numberWorkContainer, schedule);
    renderTotalWorkDays(cumulationContainer, staffArray);

    savedStaff
      ? renderApplySection(selectSection, savedStaff.name, savedStaff.staffKey)
      : renderStaffSection(selectSection, staffArray);

    init = false;
  });

  const isKakaoInApp = /KAKAOTALK/i.test(navigator.userAgent);
  if (!savedStaff && isKakaoInApp) {
    const androidInstallTip = createElement('p', {
      className: 'install-tip',
      textContent: '설치하려면 브라우저로 접속해주세요.',
    });
    createModal(androidInstallTip);
  }

  const isIos = /iPhone|iPad/.test(navigator.userAgent);
  const isInStandalone =
    'standalone' in window.navigator && window.navigator.standalone;
  if (!savedStaff && !isKakaoInApp && isIos && !isInStandalone) {
    const iosInstallTip = createElement('p', {
      className: 'install-tip',
      textContent: "설치하려면 Safari '공유 → 홈 화면에 추가' 를 선택하세요.",
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
