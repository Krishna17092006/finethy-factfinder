import nodemailer from 'nodemailer';

// Clean interface for the email sender
export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Abstract interface — swap implementation later
export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<EmailResult>;
}

// Nodemailer SMTP implementation
class NodemailerProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"FINETHY Fact-Finder" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }
}

// Console-logging fallback when SMTP is not configured
class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    console.log('═══════════════════════════════════════');
    console.log('📧 EMAIL (console fallback — SMTP not configured)');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Attachments: ${options.attachments?.map(a => a.filename).join(', ') || 'none'}`);
    console.log('Body:', options.text || '(HTML only)');
    console.log('═══════════════════════════════════════');
    return { success: true, messageId: 'console-' + Date.now() };
  }
}

// Factory: use real SMTP if configured, else console fallback
function createEmailProvider(): EmailProvider {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return new NodemailerProvider();
  }
  console.warn('⚠️ SMTP not configured — emails will be logged to console. Set SMTP_USER and SMTP_PASS in .env');
  return new ConsoleEmailProvider();
}

// Singleton
let emailProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (!emailProvider) {
    emailProvider = createEmailProvider();
  }
  return emailProvider;
}

// High-level function: send the fact-finder report email
export async function sendFactFinderEmail(options: {
  clientName: string;
  redCount: number;
  yellowCount: number;
  pdfBuffer: Buffer;
  date: string;
}): Promise<EmailResult> {
  const advisorEmail = process.env.ADVISOR_EMAIL || 'SUPPORT@FINETHY.CO';
  const provider = getEmailProvider();

  const subject = `New Client Fact-Finder: ${options.clientName} — ${options.date}`;
  const safeFilename = `FactFinder_${options.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${options.date.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #2f5aa8; color: white; padding: 16px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">FINETHY Fact-Finder</h2>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">New Client Intake Submitted</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 12px; font-size: 15px;">A new client intake has been submitted.</p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0 0 8px; font-weight: 600;">${options.clientName}</p>
          <p style="margin: 0; font-size: 14px; color: #64748b;">Key flags: 🔴 ${options.redCount} 🟡 ${options.yellowCount}</p>
        </div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">PDF report attached.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">FINETHY LLP &middot; ARN-28883</p>
      </div>
    </div>
  `;

  const text = `New Client Fact-Finder: ${options.clientName}\n\nA new client intake has been submitted. Key flags: 🔴 ${options.redCount} 🟡 ${options.yellowCount}. PDF report attached.\n\n— FINETHY LLP`;

  return provider.sendEmail({
    to: advisorEmail,
    subject,
    html,
    text,
    attachments: [{
      filename: safeFilename,
      content: options.pdfBuffer,
      contentType: 'application/pdf',
    }],
  });
}
