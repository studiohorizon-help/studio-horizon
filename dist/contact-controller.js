(() => {
  'use strict';
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#contact-status');
  const button = form?.querySelector('[type="submit"]');
  if (!form || !status || !button) return;
  const fields = {
    name: document.querySelector('#name'), email: document.querySelector('#email'),
    message: document.querySelector('#message'), phone: document.querySelector('#phone'),
    privacyConsent: document.querySelector('#privacy-consent'), phoneConsent: document.querySelector('#phone-consent')
  };
  const api = window.HorizonContact;
  const adapter = window.HorizonContactNative?.createNativeAdapter();
  const submit = api && adapter ? api.createSubmitter(adapter) : null;
  let busy = false;
  let navigating = false;
  const idleContent = [...button.childNodes];
  const messages = {
    navigating: 'FormSubmit 확인 화면으로 이동합니다. 추가 인증이 필요할 수 있습니다. 담당자 수신 완료를 의미하지는 않습니다.',
    environment: '현재는 로컬 파일 화면입니다. 입력 내용은 전송되지 않았습니다. 문의 접수는 웹 환경에서 이용해 주세요.',
    duplicate: '같은 내용의 전달 요청을 이미 시작했습니다. 이전 요청 결과를 확인해 주세요. 자동 재전송하지 않습니다.',
    error: '문의 전달을 시작하지 못했습니다. 현재 입력 내용은 유지됩니다. 연결 상태와 이전 요청 결과를 확인해 주세요.'
  };
  function unlock() {
    busy = false;
    button.disabled = false;
    button.replaceChildren(...idleContent);
    form.removeAttribute('aria-busy');
  }
  function resetValidation() { Object.values(fields).forEach(field => field.setCustomValidity('')); }
  Object.values(fields).forEach(field => {
    field.addEventListener('input', () => field.setCustomValidity(''));
    field.addEventListener('change', () => field.setCustomValidity(''));
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    if (!submit) { status.textContent = '문의 기능을 불러오지 못했습니다. 전송하지 않았습니다. 새로고침 후 다시 확인해 주세요.'; return; }
    resetValidation();
    const values = {
      name: fields.name.value, email: fields.email.value, message: fields.message.value,
      phone: fields.phone.value, privacyConsent: fields.privacyConsent.checked, phoneConsent: fields.phoneConsent.checked
    };
    const prepared = api.prepare(values);
    if (!prepared.ok) {
      Object.entries(prepared.errors).forEach(([key, message]) => fields[key].setCustomValidity(message));
      status.textContent = '필수 입력과 동의 항목을 확인해 주세요. 전송하지 않았습니다.';
      form.reportValidity(); return;
    }
    if (!form.reportValidity()) return;
    busy = true; button.disabled = true; button.textContent = '문의 전달 중…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = '입력 내용을 확인하고 FormSubmit에 전달을 요청합니다.';
    try {
      const result = await submit(values);
      navigating = result.state === 'navigating';
      status.textContent = messages[result.state] || messages.error;
    } catch { status.textContent = messages.error; }
    finally { if (!navigating) unlock(); }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && navigating) {
      navigating = false; unlock();
      status.textContent = '이전 문의 전달 화면에서 돌아왔습니다. 이전 요청 결과를 확인해 주세요. 같은 내용을 자동 재전송하지 않습니다.';
    }
  });
  if (!['http:', 'https:'].includes(window.location.protocol)) status.textContent = messages.environment;
})();
