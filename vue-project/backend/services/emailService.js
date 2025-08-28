const nodemailer = require('nodemailer');
const path = require('path');

const getResetEmailHTML = ({ clientUrl, token }) => {
  const resetUrl = `${clientUrl}/reset?token=${token}`;

  return `
<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="
                padding:24px 20px;
                background: rgb(0,45,98);
                background: linear-gradient(61deg, rgba(0,45,98,1) 75%, rgba(16,86,189,1) 75%);
              ">
                <img src="cid:logoEmail"
                    alt="Co-Working Platform"
                    style="display:block;border:0;outline:none;text-decoration:none;height:60px;width:auto;max-width:none;">             
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 8px 24px;">
                <h2 style="margin:0 0 8px 0;font-size:18px;color:#0d1b2a;">Restablecer tu contraseña</h2>
                <p style="margin:0 0 16px 0;color:#334155;font-size:14px;line-height:1.6;">
                  Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
                  Haz clic en el botón para continuar. Si no fuiste tú, ignora este mensaje.
                </p>
                <p style="text-align:center;margin:24px 0;">
                  <a href="${resetUrl}" style="display:inline-block;text-decoration:none;padding:12px 20px;border-radius:20px;background:#1056BD;color:#ffffff;font-weight:600;">
                    Restablecer contraseña
                  </a>
                </p>
                <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">
                  Si el botón no funciona, copia y pega este enlace:<br>
                  <a href="${resetUrl}" style="color:#1056BD;word-break:break-all;">${resetUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 24px 24px;color:#94a3b8;font-size:12px;">Este enlace puede caducar por seguridad.</td>
            </tr>
          </table>
          <div style="font-size:12px;color:#94a3b8;margin-top:12px;">© ${new Date().getFullYear()} Co-Working Platform</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

exports.sendResetPasswordEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GOOGLE_APP_EMAIL,
      pass: process.env.GOOGLE_APP_PW,
    },
  });

  const html = getResetEmailHTML({
    clientUrl: process.env.CLIENT_URL,
    token,
  });

  const text = `Restablecer contraseña
Hemos recibido una solicitud para restablecer tu contraseña.
Abre este enlace: ${process.env.CLIENT_URL}/reset?token=${token}
Si no fuiste tú, ignora este mensaje.`;

  const mailOptions = {
    from: process.env.GOOGLE_APP_EMAIL,
    to: email,
    subject: 'Restablecer contraseña',
    text,
    html,
    attachments: [
      {
        filename: 'logo-email.png',
        path: path.join(process.cwd(), 'assets', 'logo_horizontal_blanco.png'),
        cid: 'logoEmail',
      },
    ],
  };
  return transporter.sendMail(mailOptions);
};
