import { baseTemplate } from './base.template';

export type OtpPurpose = 'verify-email' | 'reset-password';

interface PurposeDetails {
  title: string;
  badgeText: string;
  body: string;
  warningHtml: string;
}

function getPurposeConfig(purpose: OtpPurpose): PurposeDetails {
  if (purpose === 'verify-email') {
    return {
      title: 'Xác thực địa chỉ Email',
      badgeText: 'MÃ XÁC THỰC EMAIL',
      body: 'Để hoàn tất đăng ký tài khoản của bạn, vui lòng nhập mã xác thực 6 chữ số dưới đây.',
      warningHtml: 'Mã xác thực có hiệu lực trong <strong>10 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.',
    };
  }

  return {
    title: 'Đặt lại mật khẩu',
    badgeText: 'MÃ ĐẶT LẠI MẬT KHẨU',
    body: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhập mã 6 chữ số bên dưới để tiếp tục.',
    warningHtml: 'Mã chỉ có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.',
  };
}

/**
 * OTP email template — Sleek Dark theme without copy button.
 *
 * @param name     – User's display name
 * @param code     – 6-digit OTP code (plain text)
 * @param purpose  – Which flow this OTP is for
 * @param fromName – Brand name
 */
export function otpTemplate(
  name: string,
  code: string,
  purpose: OtpPurpose,
  fromName: string = 'Ruryfo CMS',
): string {
  const cfg = getPurposeConfig(purpose);
  const digits = code.split('');

  const content = /* html */ `
    <p style="margin: 0 0 14px 0; font-size: 15px; color: #a1a1aa; line-height: 1.6;">
      Xin chào <strong style="color: #ffffff;">${name}</strong>,
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #d4d4d8; line-height: 1.7;">
      ${cfg.body}
    </p>

    <!-- OTP Code Container Card -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 22px 20px; margin: 24px 0;">
      <!-- Centered Badge Label -->
      <tr>
        <td align="center" style="font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #a1a1aa; padding-bottom: 16px;">
          ${cfg.badgeText}
        </td>
      </tr>

      <!-- Digits Row -->
      <tr>
        <td align="center" style="user-select: all; -webkit-user-select: all; -moz-user-select: all; cursor: text;">
          <table role="presentation" border="0" cellspacing="6" cellpadding="0">
            <tr>
              ${digits
                .map(
                  (d) => `
                <td class="otp-digit-td" width="44" height="52" align="center" valign="middle" style="width: 44px; height: 52px; background-color: #222226; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 4px; font-size: 24px; font-weight: 800; color: #ffffff; font-family: 'Courier New', Courier, monospace; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                  ${d}
                </td>
              `,
                )
                .join('')}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Info / Warning Box -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255, 255, 255, 0.04); border-left: 3px solid #ffffff; border-radius: 0 4px 4px 0; margin: 20px 0 10px 0; padding: 13px 16px;">
      <tr>
        <td style="font-size: 13px; color: #a1a1aa; line-height: 1.6;">
          ${cfg.warningHtml}
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(cfg.title, content, fromName);
}
