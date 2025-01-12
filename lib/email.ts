import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface WelcomeEmailParams {
  name: string;
  password: string;
  isTemporary: boolean;
}

export async function sendWelcomeEmail(
  to: string,
  { name, password, isTemporary }: WelcomeEmailParams
) {
  const subject = 'Welcome to Goods Management System';
  const html = `
    <h1>Welcome ${name}!</h1>
    <p>Your account has been created successfully.</p>
    <p>Your login credentials:</p>
    <ul>
      <li>Email: ${to}</li>
      <li>Password: ${password}</li>
    </ul>
    ${isTemporary ? '<p><strong>Please change your password upon first login.</strong></p>' : ''}
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
} 