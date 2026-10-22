(() => {
  'use strict';
  const endpoint = 'https://formsubmit.co/studiohorizon.help@gmail.com';
  const limits = Object.freeze({ name: 100, email: 254, message: 10000, phone: 32 });
  const clean = value => typeof value === 'string' ? value.trim() : '';
  function prepare(fields) {
    const data = { name: clean(fields.name), email: clean(fields.email), message: clean(fields.message) };
    const errors = {};
    for (const key of ['name', 'email', 'message']) {
      if (!data[key]) errors[key] = '필수 항목을 입력해 주세요.';
      else if (data[key].length > limits[key]) errors[key] = `최대 ${limits[key]}자까지 입력할 수 있습니다.`;
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = '이메일 주소를 확인해 주세요.';
    if (fields.privacyConsent !== true) errors.privacyConsent = '필수 개인정보 수집·이용 동의가 필요합니다.';
    const phone = fields.phoneConsent === true ? clean(fields.phone) : '';
    if (phone.length > limits.phone) errors.phone = '전화번호는 최대 32자까지 입력해 주세요.';
    if (phone && !/^[+\d()\s.-]+$/.test(phone)) errors.phone = '전화번호의 숫자와 기호를 확인해 주세요.';
    if (Object.keys(errors).length) return Object.freeze({ ok: false, errors: Object.freeze(errors) });
    const payload = {
      ...data, privacy_consent: 'agreed', privacy_notice_version: '2026-10-22',
      _subject: 'Studio Horizon 홈페이지 문의', _template: 'table'
    };
    // Only explicitly consented phone data enters the prepared request.
    if (phone) { payload.phone = phone; payload.phone_consent = 'agreed'; }
    return Object.freeze({
      ok: true,
      request: Object.freeze({
        url: endpoint, method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        body: new URLSearchParams(payload).toString()
      })
    });
  }
  // An adapter is a dependency, not a network implementation. Default is always disabled.
  function createSubmitter(adapter = async () => ({ disabled: true })) {
    let busy = false;
    let acceptedBody = null;
    return async fields => {
      if (busy) return { state: 'busy' };
      const result = prepare(fields);
      if (!result.ok) return { state: 'invalid', errors: result.errors };
      if (acceptedBody === result.request.body) return { state: 'duplicate' };
      busy = true;
      try {
        const response = await adapter(result.request);
        if (response?.disabled === true) return { state: 'disabled' };
        if (response?.navigating === true) {
          acceptedBody = result.request.body;
          return { state: 'navigating' };
        }
        if (response?.environmentBlocked === true) return { state: 'environment' };
        if (response?.accepted === true) {
          acceptedBody = result.request.body;
          return { state: 'submitted' };
        }
        return { state: 'error' };
      } catch {
        return { state: 'error' };
      } finally {
        busy = false;
      }
    };
  }
  window.HorizonContact = Object.freeze({ prepare, createSubmitter, enabled: true, limits });
})();
