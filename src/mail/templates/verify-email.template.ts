import { baseTemplate } from './base.template';

/**
 * Email template for account email verification — Sleek Dark theme.
 */
export function verifyEmailTemplate(
  name: string,
  verifyUrl: string,
  fromName: string = 'Ruryfo CMS',
): string {
  const content = /* html */ `
    <p style="margin: 0 0 14px 0; font-size: 15px; color: #a1a1aa; line-height: 1.6;">
      Xin chào <strong style="color: #ffffff;">${name}</strong>,
    </p>

    <p style="margin: 0 0 20px 0; font-size: 14px; color: #d4d4d8; line-height: 1.7;">
      Cảm ơn bạn đã đăng ký tài khoản tại <strong style="color: #ffffff;">${fromName}</strong>.
      Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn
      bằng cách nhấn vào nút bên dưới.
    </p>

    <!-- Button -->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0 22px 0;">
      <tr>
        <td align="center" style="background-color: #ffffff; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #0c0c0e; text-decoration: none; border-radius: 4px;">
            Xác thực Email
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255, 255, 255, 0.04); border-left: 3px solid #ffffff; border-radius: 0 4px 4px 0; margin: 20px 0; padding: 13px 16px;">
      <tr>
        <td style="font-size: 13px; color: #a1a1aa; line-height: 1.6;">
          Link xác thực có hiệu lực trong <strong>24 giờ</strong> kể từ khi nhận được email này.
        </td>
      </tr>
    </table>

    <p style="margin: 20px 0 8px 0; font-size: 12px; color: #71717a;">
      Hoặc sao chép đường link dưới đây vào trình duyệt:
    </p>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; padding: 10px 14px; margin-bottom: 20px;">
      <tr>
        <td style="font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #d4d4d8; word-break: break-all; line-height: 1.5;">
          ${verifyUrl}
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 12px; color: #52525b; line-height: 1.6;">
      Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email. Tài khoản sẽ không được kích hoạt nếu không xác thực.
    </p>
  `;

  return baseTemplate('Xác thực địa chỉ Email', content, fromName);
}
