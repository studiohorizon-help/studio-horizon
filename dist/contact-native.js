(() => {
  'use strict';
  const endpoint = 'https://formsubmit.co/studiohorizon.help@gmail.com';
  const required = ['name', 'email', 'message', 'privacy_consent', 'privacy_notice_version', '_subject', '_template'];
  const allowed = new Set([...required, 'phone', 'phone_consent']);
  function createNativeAdapter() {
    return request => {
      if (!['http:', 'https:'].includes(window.location.protocol)) return { environmentBlocked: true };
      if (!request || request.url !== endpoint || request.method !== 'POST') throw new Error('Invalid contact destination');
      const fields = new URLSearchParams(request.body);
      for (const key of fields.keys()) {
        if (!allowed.has(key) || fields.getAll(key).length !== 1) throw new Error('Unexpected contact field');
      }
      if (required.some(key => !fields.get(key)) || fields.get('privacy_consent') !== 'agreed' ||
          fields.get('privacy_notice_version') !== '2026-10-22' || fields.get('_template') !== 'table' ||
          fields.get('_subject') !== 'Studio Horizon 홈페이지 문의') throw new Error('Invalid contact metadata');
      if (fields.has('phone') && fields.get('phone_consent') !== 'agreed') throw new Error('Phone consent missing');
      if (fields.has('phone_consent') && !fields.get('phone')) throw new Error('Unexpected phone consent');
      const outgoing = document.createElement('form');
      outgoing.method = 'POST';
      outgoing.action = endpoint;
      for (const [name, value] of fields) {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = value;
        outgoing.append(input);
      }
      document.body.append(outgoing);
      try {
        // Native navigation keeps FormSubmit's normal verification flow intact.
        window.HTMLFormElement.prototype.submit.call(outgoing);
        return { navigating: true };
      } finally {
        outgoing.remove();
      }
    };
  }
  window.HorizonContactNative = Object.freeze({ createNativeAdapter });
})();
