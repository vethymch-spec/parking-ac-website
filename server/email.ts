import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder_key_not_configured');

const FROM_EMAIL = "CoolDrivePro Support <support@cooldrivepro.com>";
const SITE_URL = "https://cooldrivepro.com";

/**
 * Send welcome email to a new customer with their login credentials.
 * The email contains their customer number and initial password in plain text.
 */
export async function sendCustomerWelcomeEmail(params: {
  to: string;
  contactName: string;
  customerNo: string;
  initialPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, contactName, customerNo, initialPassword } = params;
    const loginUrl = `${SITE_URL}/support/login`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your CoolDrivePro Support Account – ${customerNo}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Your CoolDrivePro Support Account</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">CoolDrivePro</h1>
                      <p style="margin:6px 0 0;color:#93c5fd;font-size:13px;">After-Sales Support Portal</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <p style="margin:0 0 16px;color:#374151;font-size:15px;">Dear <strong>${contactName}</strong>,</p>
                      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                        Your CoolDrivePro after-sales support account has been created. You can now log in to submit service requests, track your tickets, and get assistance from our team.
                      </p>

                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;margin-bottom:24px;">
                        <tr>
                          <td style="padding:24px 28px;">
                            <p style="margin:0 0 4px;color:#0369a1;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Your Login Credentials</p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                              <tr>
                                <td style="padding:8px 0;border-bottom:1px solid #e0f2fe;">
                                  <span style="color:#64748b;font-size:13px;">Login Email</span>
                                  <br/>
                                  <strong style="color:#0f172a;font-size:15px;">${to}</strong>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0 8px;border-bottom:1px solid #e0f2fe;">
                                  <span style="color:#64748b;font-size:13px;">Customer Number</span>
                                  <br/>
                                  <strong style="color:#0f172a;font-size:15px;font-family:monospace;">${customerNo}</strong>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0 0;">
                                  <span style="color:#64748b;font-size:13px;">Initial Password</span>
                                  <br/>
                                  <strong style="color:#0f172a;font-size:15px;font-family:monospace;">${initialPassword}</strong>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;">
                        ⚠️ <strong>You will be required to change your password on first login.</strong> Please keep your credentials secure.
                      </p>

                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
                        <tr>
                          <td style="background:#1e3a5f;border-radius:6px;">
                            <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                              Log In to Support Portal →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Login URL:</p>
                      <p style="margin:0 0 24px;color:#3b82f6;font-size:13px;"><a href="${loginUrl}" style="color:#3b82f6;">${loginUrl}</a></p>

                      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
                        If you have any questions, please contact our support team by replying to this email.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                        © ${new Date().getFullYear()} CoolDrivePro. All rights reserved.<br/>
                        This email was sent to ${to} because an account was created for you.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Failed to send welcome email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Email] Exception sending welcome email:", message);
    return { success: false, error: message };
  }
}

/**
 * Send password reset email with a reset link.
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  contactName: string;
  resetUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, contactName, resetUrl } = params;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Reset Your CoolDrivePro Support Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">CoolDrivePro</h1>
                      <p style="margin:6px 0 0;color:#93c5fd;font-size:13px;">Password Reset Request</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <p style="margin:0 0 16px;color:#374151;font-size:15px;">Dear <strong>${contactName}</strong>,</p>
                      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                        We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
                      </p>
                      <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
                        <tr>
                          <td style="background:#1e3a5f;border-radius:6px;">
                            <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                              Reset Password →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Or copy this link:</p>
                      <p style="margin:0 0 24px;color:#3b82f6;font-size:12px;word-break:break-all;"><a href="${resetUrl}" style="color:#3b82f6;">${resetUrl}</a></p>
                      <p style="margin:0;color:#9ca3af;font-size:13px;">If you did not request a password reset, please ignore this email.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                        © ${new Date().getFullYear()} CoolDrivePro. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Failed to send reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Email] Exception sending reset email:", message);
    return { success: false, error: message };
  }
}
