/**
 * Base HTML email template — Sleek Dark / Black theme.
 * Features an elevated circular badge for the brand logo, refined typography, and 100% email deliverability.
 * Logo: https://cms.hieurury.id.vn/icons.svg
 */
export function baseTemplate(
  title: string,
  content: string,
  fromName: string = 'Ruryfo CMS',
): string {
  const year = new Date().getFullYear();

  return /* html */ `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="vi">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #0c0c0e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e4e4e7;
    }

    a { color: #ffffff; text-decoration: underline; }

    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .email-card { padding: 24px 18px !important; }
      .otp-digit-td { width: 36px !important; height: 46px !important; font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0c0e; color: #e4e4e7;">
  <!-- Outer Table with dark background and subtle dot grid -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0c0e; background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 20px 20px; width: 100%;">
    <tr>
      <td align="center" style="padding: 44px 16px 64px;">
        
        <!-- Container Table (max-width: 540px) -->
        <table role="presentation" class="email-container" width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; width: 100%;">
          
          <!-- Brand Header with Circular Badge for Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <!-- Circular badge wrapper -->
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" valign="middle" style="width: 44px; height: 44px; background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 50%; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">
                          <img src="https://cms.hieurury.id.vn/icons.svg" width="24" height="24" alt="${fromName}" style="display: block; margin: 0 auto; border: 0; width: 24px; height: 24px;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-left: 12px; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ${fromName}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td class="email-card" style="background-color: #141417; border: 1px solid rgba(255, 255, 255, 0.08); border-top: 3px solid #ffffff; border-radius: 6px; padding: 36px 36px 32px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px; padding-bottom: 12px;">
                    ${title}
                  </td>
                </tr>
                <tr>
                  <td style="height: 1px; background-color: rgba(255, 255, 255, 0.08); font-size: 1px; line-height: 1px; margin-bottom: 20px;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding-top: 18px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 500; color: #71717a;">
                © ${year} ${fromName}. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #52525b; line-height: 1.6;">
                Email này được gửi tự động từ hệ thống ${fromName}.<br />
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
