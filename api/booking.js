const nodemailer = require('nodemailer');

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { name, email, note, date, time } = req.body || {};

  if (!name || !email || !date || !time) {
    res.status(400).json({ error: 'missing_fields' });
    return;
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('GMAIL_USER / GMAIL_APP_PASSWORD env vars are not set');
    res.status(500).json({ error: 'email_not_configured' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Mynerasoft Web Sitesi" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Yeni Görüşme Talebi — ${name}`,
      text:
        `Yeni bir görüşme talebi alındı.\n\n` +
        `Ad Soyad: ${name}\n` +
        `E-posta: ${email}\n` +
        `Tarih: ${date}\n` +
        `Saat: ${time}\n` +
        (note ? `Not: ${note}\n` : ''),
      html:
        `<h2>Yeni Görüşme Talebi</h2>` +
        `<p><strong>Ad Soyad:</strong> ${escapeHtml(name)}</p>` +
        `<p><strong>E-posta:</strong> ${escapeHtml(email)}</p>` +
        `<p><strong>Tarih:</strong> ${escapeHtml(date)}</p>` +
        `<p><strong>Saat:</strong> ${escapeHtml(time)}</p>` +
        (note ? `<p><strong>Not:</strong> ${escapeHtml(note)}</p>` : ''),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('booking email error', err);
    res.status(500).json({ error: 'send_failed' });
  }
};
