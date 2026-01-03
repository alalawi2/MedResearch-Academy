/**
 * Email service for sending session reminders
 * Uses the built-in Forge API for email delivery
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using the Forge API
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!forgeApiUrl || !forgeApiKey) {
    console.error("Email service not configured: Missing FORGE API credentials");
    return false;
  }

  try {
    const response = await fetch(`${forgeApiUrl}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${forgeApiKey}`,
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || stripHtml(options.html),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to send email: ${response.status} - ${error}`);
      return false;
    }

    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Simple HTML to text converter
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Generate 24-hour reminder email HTML
 */
export function generate24HourReminderEmail(sessionData: {
  title: string;
  sessionDate: Date;
  zoomLink: string;
  description?: string;
}): string {
  const formattedDate = sessionData.sessionDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const formattedTime = sessionData.sessionDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Reminder - 24 Hours</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">MedResearch Academy</h1>
              <p style="margin: 10px 0 0 0; color: #60a5fa; font-size: 14px; font-weight: 500;">Virtual Research Series</p>
            </td>
          </tr>
          
          <!-- Alert Banner -->
          <tr>
            <td style="background-color: #fef3c7; padding: 20px 30px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">
                ⏰ Reminder: Your session starts in 24 hours!
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e3a5f; font-size: 24px; font-weight: 700;">${sessionData.title}</h2>
              
              ${sessionData.description ? `<p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">${sessionData.description}</p>` : ''}
              
              <!-- Session Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #475569; font-size: 14px; font-weight: 600;">📅 DATE</p>
                    <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${formattedDate}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #475569; font-size: 14px; font-weight: 600;">🕐 TIME</p>
                    <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${formattedTime}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #475569; font-size: 14px; font-weight: 600;">💻 PLATFORM</p>
                    <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">Zoom (Online)</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${sessionData.zoomLink}" style="display: inline-block; background-color: #1e3a5f; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(30, 58, 95, 0.3);">
                      Join Zoom Meeting
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; text-align: center;">
                You'll receive another reminder 1 hour before the session starts.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                MedResearch Academy | Empowering Medical Researchers
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                @Medresearch_om | medresearch-academy.om
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate 1-hour reminder email HTML
 */
export function generate1HourReminderEmail(sessionData: {
  title: string;
  sessionDate: Date;
  zoomLink: string;
  description?: string;
}): string {
  const formattedTime = sessionData.sessionDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Starting Soon!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">MedResearch Academy</h1>
              <p style="margin: 10px 0 0 0; color: #60a5fa; font-size: 14px; font-weight: 500;">Virtual Research Series</p>
            </td>
          </tr>
          
          <!-- Urgent Alert Banner -->
          <tr>
            <td style="background-color: #fee2e2; padding: 20px 30px; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #991b1b; font-size: 18px; font-weight: 700;">
                🚨 Starting in 1 Hour!
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e3a5f; font-size: 24px; font-weight: 700;">${sessionData.title}</h2>
              
              <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                Your session is starting soon! Make sure you're ready to join.
              </p>
              
              <!-- Session Time -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 2px solid #f59e0b;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">SESSION STARTS AT</p>
                    <p style="margin: 10px 0 0 0; color: #78350f; font-size: 24px; font-weight: 700;">${formattedTime}</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${sessionData.zoomLink}" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.4); text-transform: uppercase;">
                      Join Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; text-align: center; line-height: 1.6;">
                💡 <strong>Tip:</strong> Join a few minutes early to test your audio and video settings.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                MedResearch Academy | Empowering Medical Researchers
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                @Medresearch_om | medresearch-academy.om
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
