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
        type: 'OAuth2',
        user: this.config.get<string>('GMAIL_USER'),
        clientId: this.config.get<string>('GMAIL_CLIENT_ID'),
        clientSecret: this.config.get<string>('GMAIL_CLIENT_SECRET'),
        refreshToken: this.config.get<string>('GMAIL_REFRESH_TOKEN'),
      },
    });
  }

  async sendSubmissionConfirmation(ctx: SubmissionMailContext): Promise<void> {
    const formattedDate = new Date(ctx.eventDate).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await this.transporter.sendMail({
      from: `"${ctx.campaignName}" <${this.config.get<string>('GMAIL_USER')}>`,
      to: ctx.recipientEmail,
      subject: `Pendaftaran Berhasil – ${ctx.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827;">Halo, ${ctx.recipientName}!</h2>
          <p style="color: #374151; font-size: 16px;">
            Selamat! Pendaftaran kamu untuk menghadiri event berikut telah berhasil.
          </p>

          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">Campaign</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${ctx.campaignName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Produk / Event</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${ctx.productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tanggal Event</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${formattedDate}</td>
              </tr>
            </table>
          </div>

          <p style="color: #374151; font-size: 14px;">
            Sampai jumpa di event-nya! Jika ada pertanyaan, balas email ini.
          </p>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            Email ini dikirim otomatis, mohon tidak membalas jika tidak ada pertanyaan.
          </p>
        </div>
      `,
    });

    this.logger.log(`Confirmation email sent to ${ctx.recipientEmail}`);
  }
}
