(() => {
  'use strict';
  // Deterministic company information. No AI API, network, or persistent storage.
  function answer(message) {
    if (/접수|전송|저장|개인정보|기록|상담원|AI|인공지능/i.test(message)) return '이 안내 챗봇은 등록된 서비스 정보로 답합니다. 챗봇 자체의 AI·상담원 연결, 자동 접수·전송·대화 저장은 없습니다. 문의는 본문의 문의 양식에서 개인정보 동의 후 직접 제출해 주세요. 대화는 현재 화면에만 표시되며 새로고침하면 사라집니다. 개인정보는 입력하지 마세요.';
    if (/가격|비용|견적|예산|일정|기간|납기/.test(message)) return '비용과 일정은 필요한 화면·기능, 기존 자료와 운영 환경을 확인한 뒤 협의합니다. 정해진 가격이나 납기를 안내드리기는 어렵습니다. 원하는 작업과 목표 시점을 문의 초안에 적어 주세요.';
    if (/자동화|연동|유지보수|운영|API/i.test(message)) return '외부 서비스 연동, 반복 업무 자동화, 기존 서비스 수정·유지보수를 함께 살펴봅니다. 현재 사용하는 도구와 반복되는 작업, 연결하려는 서비스를 알려 주세요. 가능 여부는 해당 시스템과 권한을 확인한 뒤 협의합니다.';
    if (/개선|최적화|리뉴얼|느리|속도|모바일|접근성|검색/.test(message)) return '기존 홈페이지의 모바일 화면, 콘텐츠, 속도·접근성·검색 친화 구조를 개선하는 작업을 다룹니다. 현재 사이트와 불편한 화면, 바꾸고 싶은 점을 정리해 주세요. 검색 노출이나 순위는 보장하지 않습니다.';
    if (/앱|웹 서비스|웹서비스|예약|신청|관리자/.test(message)) return '예약·신청, 관리자 화면 등 목적에 맞는 앱·웹 서비스를 함께 정리하고 만듭니다. 누가 사용하는지, 꼭 필요한 기능, 기존 서비스와의 연결 여부가 출발점입니다.';
    if (/홈페이지|웹사이트|랜딩|쇼핑몰|브랜드|제작/.test(message)) return '회사·브랜드 홈페이지, 랜딩페이지, 쇼핑몰 등 필요한 웹사이트를 기획하고 제작합니다. 사이트의 목적, 필요한 페이지, 준비된 글·사진과 원하는 참고 화면을 알려 주세요.';

    return '홈페이지 제작, 기존 홈페이지 개선·최적화, 앱·웹 서비스, 연동·자동화·유지보수를 안내해 드릴 수 있습니다. 자세한 요구 사항은 담당자 확인이 필요합니다. 필요한 작업을 적고 “문의 초안에 반영”을 누르면 아래 문의 양식에 내용을 옮길 수 있습니다.';
  }
  window.HorizonGuide = Object.freeze({ answer });
  const panel = document.querySelector('#site-chat');
  const launcher = document.querySelector('#site-chat-launcher');
  if (!panel || !launcher) return;
  const input = document.querySelector('#site-chat-input');
  const log = document.querySelector('#site-chat-log');
  const error = document.querySelector('#site-chat-error');
  const contactMessage = document.querySelector('#message');
  const status = document.querySelector('#contact-status');
  const phone = document.querySelector('#phone');
  const phoneConsent = document.querySelector('#phone-consent');
  const topics = [...document.querySelectorAll('[data-chat-topic]')];
  let opener = launcher;
  let history = [];
  const inertBefore = new Map();
  const welcome = '안녕하세요. 스튜디오호라이즌 서비스 안내입니다. 필요한 작업을 선택하거나 질문해 주세요. 문의 접수는 본문의 문의 양식을 이용해 주세요.';
  function add(role, text) {
    const item = document.createElement('div');
    item.className = `chat-message ${role}`;
    const label = document.createElement('p');
    label.className = 'chat-message-label';
    label.textContent = role === 'user' ? '나' : '호라이즌 안내';
    const bubble = document.createElement('p');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    item.append(label, bubble);
    log.append(item);
    while (log.children.length > 41) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  function clear() {
    history = [];
    log.replaceChildren();
    input.value = '';
    error.hidden = true;
    add('assistant', welcome);
  }
  function open(button) {
    opener = button;
    panel.hidden = false;
    document.body.classList.add('chat-is-open');
    launcher.setAttribute('aria-expanded', 'true');
    for (const element of document.body.children) {
      if (element === panel || element.tagName === 'SCRIPT') continue;
      inertBefore.set(element, element.inert);
      element.inert = true;
    }
    input.focus();
  }
  function close(restoreFocus = true) {
    panel.hidden = true;
    document.body.classList.remove('chat-is-open');
    launcher.setAttribute('aria-expanded', 'false');
    inertBefore.forEach((value, element) => { element.inert = value; });
    inertBefore.clear();
    if (restoreFocus) opener.focus();
  }
  function submit(value) {
    const text = value.trim();
    if (!text || text.length > 500) {
      error.textContent = '질문을 1~500자로 입력해 주세요.';
      error.hidden = false;
      input.focus();
      return;
    }
    error.hidden = true;
    try {
      const response = answer(text);
      history.push(text);
      history = history.slice(-6);
      add('user', text);
      add('assistant', response);
      input.value = '';
      input.focus();
    } catch {
      error.textContent = '안내를 표시하지 못했습니다. 다시 질문하거나 문의 양식을 이용해 주세요.';
      error.hidden = false;
    }
  }
  launcher.hidden = false;
  launcher.addEventListener('click', () => open(launcher));
  document.querySelectorAll('[data-open-chat]').forEach(button => button.addEventListener('click', () => open(button)));
  document.querySelector('#site-chat-close').addEventListener('click', () => close());
  document.querySelector('#site-chat-form').addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      submit(input.value);
    }
  });
  topics.forEach(button => button.addEventListener('click', () => submit(button.dataset.chatTopic)));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll('button, textarea, a[href]')].filter(element => !element.disabled && !element.hidden);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.querySelector('#site-chat-clear').addEventListener('click', () => { clear(); input.focus(); });
  document.querySelector('#site-chat-draft').addEventListener('click', () => {
    const draft = history.length ? '필요한 작업:\n' + history.map(text => '- ' + text).join('\n') : '';
    if (!draft) { error.textContent = '필요한 작업을 먼저 질문해 주세요.'; error.hidden = false; return; }
    if (!contactMessage.value.includes(draft)) {
      contactMessage.value = [contactMessage.value.trim(), draft].filter(Boolean).join('\n\n');
    }
    close(false);
    contactMessage.focus();
    status.textContent = '챗봇에서 정리한 내용을 문의 초안에 추가했습니다. 아직 전송되지 않았습니다.';
  });
  function syncPhone() {
    phone.disabled = !phoneConsent.checked;
    if (!phoneConsent.checked) phone.value = '';
  }
  phoneConsent.addEventListener('change', syncPhone);
  window.addEventListener('pageshow', syncPhone);
  syncPhone();
  clear();
})();
