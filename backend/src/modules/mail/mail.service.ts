import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SubmissionMailContext {
  recipientName: string;
  recipientEmail: string;
  campaignName: string;
  productName: string;
  eventDate: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('GMAIL_USER'),
        pass: this.config.get<string>('GMAIL_PASSWORD'),
      },
    });
  }

  async sendSubmissionConfirmation(ctx: SubmissionMailContext): Promise<void> {
    const formattedDate = new Date(ctx.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const logoImg = `<img src="https://res.cloudinary.com/dxisnzl5i/image/upload/v1775936172/campaigns/fepcv0prqxearzxskruz.png" alt="Caaampaign" width="32" height="32" style="display:block;" />`;

    await this.transporter.sendMail({
      from: `"Caaampaign" <${this.config.get<string>('GMAIL_USER')}>`,
      to: ctx.recipientEmail,
      subject: `Registration Confirmed – ${ctx.productName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#fafafa;font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:16px;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td style="padding:28px 32px;border-bottom:1px solid #e5e5e5;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:middle;padding-right:10px;">${logoImg}</td>
                          <td style="vertical-align:middle;font-size:18px;font-weight:700;color:#0a0a0a;letter-spacing:-0.3px;">Caaampaign</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 32px 0;">
                      <p style="margin:0 0 8px;font-size:13px;font-weight:500;color:#737373;text-transform:uppercase;letter-spacing:0.8px;">Registration Confirmed</p>
                      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0a0a0a;line-height:1.3;">You're in, ${ctx.recipientName}!</h1>
                      <p style="margin:0 0 28px;font-size:15px;color:#737373;line-height:1.6;">
                        Your registration has been received. We look forward to seeing you at the event.
                      </p>
                    </td>
                  </tr>

                  <!-- Detail Card -->
                  <tr>
                    <td style="padding:0 32px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="font-size:12px;color:#737373;text-transform:uppercase;letter-spacing:0.5px;width:130px;">Campaign</td>
                                      <td style="font-size:14px;font-weight:600;color:#0a0a0a;">${ctx.campaignName}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="font-size:12px;color:#737373;text-transform:uppercase;letter-spacing:0.5px;width:130px;">Event</td>
                                      <td style="font-size:14px;font-weight:600;color:#0a0a0a;">${ctx.productName}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:10px 0;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="font-size:12px;color:#737373;text-transform:uppercase;letter-spacing:0.5px;width:130px;">Date</td>
                                      <td style="font-size:14px;font-weight:600;color:#0a0a0a;">${formattedDate}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:32px;border-top:1px solid #e5e5e5;">
                      <p style="margin:0;font-size:12px;color:#a3a3a3;line-height:1.5;">
                        This email was sent automatically by Caaampaign. Please do not reply unless you have a question.
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

    this.logger.log(`Confirmation email sent to ${ctx.recipientEmail}`);
  }
}
