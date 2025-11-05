(async () => {
  // 1) Detectar IP pública del cliente
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const { ip } = await r.json();
    document.getElementById('ipPublica').value = ip || '';
  } catch (e) {
    console.warn('No se pudo obtener IP pública:', e);
  }

  // 2) Enviar al Webhook de n8n
  const form = document.getElementById('calc-form');
  const estado = document.getElementById('estado');
  const resultado = document.getElementById('resultado');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    estado.textContent = 'Enviando...';
    resultado.textContent = '';

    const payload = {
      instruccion: document.getElementById('instruccion').value.trim(),
      a: document.getElementById('a').value === '' ? null : Number(document.getElementById('a').value),
      b: document.getElementById('b').value === '' ? null : Number(document.getElementById('b').value),
      ip_publica: document.getElementById('ipPublica').value || null,
      ts: new Date().toISOString()
    };

    try {
      // ⬅️ Pega aquí tu URL de PRODUCCIÓN del Webhook
      const WEBHOOK_URL = 'https://flanconer.app.n8n.cloud/webhook-test/operacion-ai';

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      estado.textContent = data.mensaje || 'Registrado en Google Sheets.';
      resultado.textContent =
        (data && typeof data.resultado !== 'undefined') ? String(data.resultado) : '';
    } catch (err) {
      console.error(err);
      estado.textContent = 'Error al enviar al servidor.';
    }
  });
})();

