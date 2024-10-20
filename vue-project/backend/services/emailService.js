const nodemailer = require('nodemailer');

exports.sendResetPasswordEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GOOGLE_APP_EMAIL,
            pass: process.env.GOOGLE_APP_PW,
        },
    });

    const mailOptions = {
        from: process.env.GOOGLE_APP_EMAIL,
        to: email,
        subject: 'Password reset',
        html: `<p>Click <a href="${process.env.CLIENT_URL}/reset?token=${token}">here</a> to reset your password</p>`,
    };

    return transporter.sendMail(mailOptions);
};
