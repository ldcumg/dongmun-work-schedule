type ButtonData = {
  label: string;
  onClick: () => void;
};

const createModal = (buttonData: ButtonData[]) => {
  // 모달 루트
  const modalRoot = document.createElement('div');
  modalRoot.className = 'modal-portal';

  // 모달 콘텐츠
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // 닫기 버튼
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '닫기';
  const close = () => {
    modalRoot.remove(); // DOM에서 완전히 제거
  };
  closeBtn.addEventListener('click', close);

  // 버튼 컨테이너
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';

  // n개의 버튼 생성
  buttonData.forEach(({ label, onClick }) => {
    const btn = document.createElement('button');
    btn.textContent = label; // 안전하게 textContent 사용
    btn.addEventListener('click', onClick);
    buttonContainer.appendChild(btn);
  });

  modalContent.append(closeBtn, buttonContainer);
  modalRoot.appendChild(modalContent);

  // 닫기 버튼
  return { close };
};
