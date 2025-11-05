// script.js — Calculadora IA (OpenAI + n8n)
(() => {
  const WEBHOOK_URL = 'https://flanconer.app.n8n.cloud/webhook-test/operacion-ai'; // ← tu URL de PRODUCCIÓN

  const $ = (id) => document.getElementById(id);
  const form = $('calc-form');
  const estado = $('estado');
  const resultado = $('resultado');

  // 1) Detectar IP pública del cliente
  (async () => {
    try {
      const r = await fetch('https://api.ipify.org?format=json');
      const { ip } = await r.json();
      $('ipPublica').value = ip || '';
    } catch (e) {
      console.warn('No se pudo obtener IP pública:', e);
      $('ipPublica').value = null;
    }
  })();

  // 2) Enviar instrucción al Webhook de n8n
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    estado.textContent = 'Enviando...';
    resultado.textContent = '';

    const payload = {
      instruccion: $('instruccion').value.trim(),
      a: $('a').value === '' ? null : Number($('a').value),
      b: $('b').value === '' ? null : Number($('b').value),
      ip_publica: $('ipPublica').value || null,
      ts: new Date().toISOString(),
      // Puedes añadir más metadatos si quieres:
      // ua: navigator.userAgent
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Leer cuerpo como texto y validar que realmente sea JSON
      const ct = res.headers.get('content-type') || '';
      const raw = await res.text();

      if (!res.ok) {
        console.error('Respuesta del servidor:', raw);
        throw new Error(`HTTP ${res.status}: ${raw || 'sin cuerpo'}`);
      }

      if (!ct.includes('application/json') || !raw) {
        throw new Error(`Respuesta no JSON (${ct}): ${raw || 'vacía'}`);
      }

      const data = JSON.parse(raw);

      estado.textContent = data.mensaje || 'Registrado en Google Sheets.';
      resultado.textContent =
        (typeof data.resultado !== 'undefined') ? String(data.resultado) : '';

    } catch (err) {
      console.error(err);
      estado.textContent = 'Error al enviar al servidor.';
      // Opcional: muestra detalle para depuración
      // resultado.textContent = String(err?.message || err);
    }
  });
})();
