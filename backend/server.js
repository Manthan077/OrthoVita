import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'OrthoVita - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00e5ff;">OrthoVita Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="background: #0d1526; color: #00ff9d; padding: 20px; text-align: center; letter-spacing: 8px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore.get(email);

  if (!stored) {
    return res.json({ success: false, error: 'OTP expired or not found' });
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return res.json({ success: false, error: 'OTP expired' });
  }

  if (stored.otp === otp) {
    otpStore.delete(email);
    return res.json({ success: true, message: 'OTP verified' });
  }

  res.json({ success: false, error: 'Invalid OTP' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
