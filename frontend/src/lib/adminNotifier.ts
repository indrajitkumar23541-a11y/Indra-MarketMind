import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

export interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  method: string;
  registeredTimestamp: number;
  ip?: string;
  userAgent?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "registered_users.json");

// Ensure data folder exists
async function ensureDataFile(): Promise<RegisteredUserRecord[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const content = await fs.readFile(USERS_FILE, "utf-8");
      return JSON.parse(content) as RegisteredUserRecord[];
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
  } catch (err) {
    console.error("[AdminNotifier] Error accessing data file:", err);
    return [];
  }
}

export async function getRegisteredUsers(): Promise<RegisteredUserRecord[]> {
  return ensureDataFile();
}

export async function recordAndNotifyNewUser(payload: {
  userId: string;
  name: string;
  email: string;
  joinedAt?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
}): Promise<{
  isNew: boolean;
  totalUsers: number;
  telegramSent: boolean;
  emailSent: boolean;
  emailStatus: string;
}> {
  const users = await ensureDataFile();
  const existing = users.find((u) => u.id === payload.userId || (payload.email && u.email.toLowerCase() === payload.email.toLowerCase()));

  const now = new Date();
  const joinedAt = payload.joinedAt || now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const method = payload.method || "Clerk Authentication";
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "indrajitkumar23541@gmail.com";

  let isNew = false;
  let totalUsers = users.length;

  if (!existing) {
    isNew = true;
    const newRecord: RegisteredUserRecord = {
      id: payload.userId,
      name: payload.name || "New Trader",
      email: payload.email || "No email provided",
      joinedAt,
      method,
      registeredTimestamp: now.getTime(),
      ip: payload.ip,
      userAgent: payload.userAgent,
    };
    users.unshift(newRecord);
    totalUsers = users.length;
    try {
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    } catch (err) {
      console.error("[AdminNotifier] Failed to persist user record:", err);
    }
  }

  let telegramSent = false;
  let emailSent = false;
  let emailStatus = "pending";

  // Only dispatch notifications if this is a newly detected user
  if (isNew) {
    // 1. Instant Telegram Notification to Admin Phone
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      try {
        const text = [
          "🚀 *NEW USER REGISTERED ON INDRA-MARKETMIND!*",
          "",
          `👤 *Name:* ${payload.name || "N/A"}`,
          `📧 *Email:* \`${payload.email || "N/A"}\``,
          `📅 *Joined:* ${joinedAt}`,
          `🔑 *Method:* ${method}`,
          `🆔 *User ID:* \`${payload.userId}\``,
          `📊 *Total Platform Users:* ${totalUsers}`,
        ].join("\n");

        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
          }),
        });
        telegramSent = tgRes.ok;
      } catch (tgErr) {
        console.warn("[AdminNotifier] Telegram alert failed:", tgErr);
      }
    }

    // 2. Email Notification to indrajitkumar23541@gmail.com
    const emailSubject = `🚀 New User Joined Indra-MarketMind: ${payload.name} (${payload.email})`;
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #05070D; color: #FFFFFF; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #00F0FF33;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #00F0FF; margin: 0; font-size: 24px; letter-spacing: 1px;">Indra-MarketMind V3.0</h2>
          <p style="color: #94A3B8; font-size: 13px; margin-top: 5px;">Admin Alert System • New User Registration</p>
        </div>
        
        <div style="background: rgba(13, 20, 36, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #10B981; margin-top: 0; font-size: 16px;">✨ New User Successfully Registered</h3>
          
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <td style="padding: 10px 0; color: #94A3B8; width: 35%;">User Name:</td>
              <td style="padding: 10px 0; color: #FFFFFF; font-weight: bold;">${payload.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <td style="padding: 10px 0; color: #94A3B8;">Email Address:</td>
              <td style="padding: 10px 0; color: #00F0FF; font-weight: bold;">${payload.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <td style="padding: 10px 0; color: #94A3B8;">Registration Date:</td>
              <td style="padding: 10px 0; color: #FFFFFF;">${joinedAt}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <td style="padding: 10px 0; color: #94A3B8;">Sign-In Method:</td>
              <td style="padding: 10px 0; color: #F59E0B; font-weight: bold;">${method}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94A3B8;">Total Users:</td>
              <td style="padding: 10px 0; color: #10B981; font-weight: bold;">${totalUsers}</td>
            </tr>
          </table>
        </div>

        <div style="font-size: 12px; color: #64748B; text-align: center;">
          Sent automatically by Indra-MarketMind Terminal • Logged in at ${joinedAt}
        </div>
      </div>
    `;

    // Attempt A: Resend API (HTTP REST, zero SMTP config required)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Indra-MarketMind <onboarding@resend.dev>",
            to: [adminEmail],
            subject: emailSubject,
            html: emailHtml,
          }),
        });
        if (resendRes.ok) {
          emailSent = true;
          emailStatus = "delivered (via Resend)";
        }
      } catch (resendErr) {
        console.warn("[AdminNotifier] Resend dispatch error:", resendErr);
      }
    }

    // Attempt B: Gmail SMTP via Nodemailer (Requires Gmail 16-character App Password)
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER || adminEmail;
    const smtpPass = process.env.SMTP_PASS;

    if (!emailSent && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Indra-MarketMind Alert" <${smtpUser}>`,
          to: adminEmail,
          subject: emailSubject,
          html: emailHtml,
        });

        emailSent = true;
        emailStatus = "delivered (via Gmail SMTP)";
      } catch (mailErr: any) {
        console.warn("[AdminNotifier] SMTP send failed:", mailErr?.message || mailErr);
        emailStatus = `failed: ${mailErr?.message || "SMTP error"}`;
      }
    } else if (!emailSent) {
      emailStatus = "pending_credentials (Set SMTP_PASS or RESEND_API_KEY in Vercel to activate direct Gmail delivery)";
      console.log(`[AdminNotifier] Registration Alert Queued for ${adminEmail}:`, {
        name: payload.name,
        email: payload.email,
        joinedAt,
        method,
      });
    }
  }

  return {
    isNew,
    totalUsers,
    telegramSent,
    emailSent,
    emailStatus,
  };
}
