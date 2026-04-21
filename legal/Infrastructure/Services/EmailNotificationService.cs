using LegalRO.CaseManagement.Infrastructure.Settings;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Globalization;

namespace LegalRO.CaseManagement.Infrastructure.Services;

public class EmailNotificationService
{
    private readonly NotificationSettings _settings;
    private readonly ILogger<EmailNotificationService> _logger;
    private static readonly CultureInfo _ro = new("ro-RO");

    public EmailNotificationService(
        IOptions<NotificationSettings> options,
        ILogger<EmailNotificationService> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct = default, (string fileName, byte[] data)? attachment = null)
    {
        if (_settings.Smtp is { IsEnabled: true })
        {
            await SendViaSmtpAsync(toEmail, toName, subject, htmlBody, ct, attachment);
        }
        else if (_settings.SendGrid.IsEnabled)
        {
            await SendViaSendGridAsync(toEmail, toName, subject, htmlBody, ct, attachment);
        }
        else
        {
            _logger.LogInformation("[Email MOCK] To: {To} | Subject: {Subject}", toEmail, subject);
        }
    }

    private async Task SendViaSmtpAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct, (string fileName, byte[] data)? attachment = null)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FirmName, _settings.FirmEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyPart = new TextPart("html") { Text = htmlBody };
            if (attachment is { } att)
            {
                var multipart = new MimeKit.Multipart("mixed");
                multipart.Add(bodyPart);
                var attPart = new MimeKit.MimePart("application", "pdf")
                {
                    Content = new MimeKit.MimeContent(new MemoryStream(att.data)),
                    ContentDisposition = new MimeKit.ContentDisposition(MimeKit.ContentDisposition.Attachment),
                    ContentTransferEncoding = MimeKit.ContentEncoding.Base64,
                    FileName = att.fileName
                };
                multipart.Add(attPart);
                message.Body = multipart;
            }
            else
            {
                message.Body = bodyPart;
            }

            using var client = new SmtpClient();
            await client.ConnectAsync(_settings.Smtp!.Host, _settings.Smtp.Port,
                _settings.Smtp.Port == 465
                    ? MailKit.Security.SecureSocketOptions.SslOnConnect
                    : MailKit.Security.SecureSocketOptions.StartTlsWhenAvailable,
                ct);

            if (!string.IsNullOrWhiteSpace(_settings.Smtp.Username) &&
                !string.IsNullOrWhiteSpace(_settings.Smtp.Password))
            {
                await client.AuthenticateAsync(_settings.Smtp.Username, _settings.Smtp.Password, ct);
            }

            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("[SMTP] Email sent to {Email} | Subject: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SMTP] Failed to send email to {Email}", toEmail);
            throw;
        }
    }

    private async Task SendViaSendGridAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct, (string fileName, byte[] data)? attachment = null)
    {
        try
        {
            var client = new SendGridClient(_settings.SendGrid.ApiKey);
            var from = new EmailAddress(_settings.SendGrid.FromEmail, _settings.SendGrid.FromName);
            var to = new EmailAddress(toEmail, toName);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlBody);
            if (attachment is { } att)
                msg.AddAttachment(att.fileName, Convert.ToBase64String(att.data), "application/pdf");

            var response = await client.SendEmailAsync(msg, ct);

            if ((int)response.StatusCode >= 400)
            {
                var body = await response.Body.ReadAsStringAsync(ct);
                _logger.LogError("[SendGrid] Error {Status}: {Body}", response.StatusCode, body);
                throw new InvalidOperationException($"SendGrid returned {response.StatusCode}: {body}");
            }
            else
            {
                _logger.LogInformation("[SendGrid] Email sent to {Email} | Subject: {Subject}", toEmail, subject);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SendGrid] Failed to send email to {Email}", toEmail);
            throw;
        }
    }

    public async Task SendLeadConfirmationEmailAsync(string toEmail, string toName, string practiceArea, CancellationToken ct = default)
    {
        var subject = $"✅ Am primit solicitarea dvs. — {_settings.FirmName}";
        var year = DateTime.UtcNow.Year;
        var html = $"""
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Confirmare solicitare</title></head>
            <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a237e 0%,#3949ab 100%);padding:36px 40px;text-align:center">
                        <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px">⚖️ {_settings.FirmName}</div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px;letter-spacing:0.5px">Servicii juridice profesionale</div>
                      </td>
                    </tr>

                    <!-- Success badge -->
                    <tr>
                      <td style="background:#e8f5e9;padding:18px 40px;text-align:center;border-bottom:1px solid #c8e6c9">
                        <span style="display:inline-block;background:#2e7d32;color:white;font-size:13px;font-weight:700;padding:6px 20px;border-radius:20px;letter-spacing:0.5px">
                          ✅ SOLICITARE INREGISTRATA CU SUCCES
                        </span>
                      </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                      <td style="padding:36px 40px 0">
                        <p style="font-size:18px;font-weight:700;color:#1a237e;margin:0 0 12px">Buna ziua, {System.Net.WebUtility.HtmlEncode(toName)},</p>
                        <p style="font-size:15px;color:#444;line-height:1.7;margin:0">
                          Va multumim ca ati contactat <strong>{_settings.FirmName}</strong>.
                          Solicitarea dvs. a fost inregistrata si va fi analizata cu prioritate de catre echipa noastra.
                        </p>
                      </td>
                    </tr>

                    <!-- Details card -->
                    <tr>
                      <td style="padding:24px 40px">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border-radius:8px;border:1px solid #c5cae9;overflow:hidden">
                          <tr>
                            <td style="padding:16px 20px;border-bottom:1px solid #c5cae9;background:#e8eaf6">
                              <span style="font-size:11px;font-weight:700;color:#1a237e;text-transform:uppercase;letter-spacing:1px">Detalii solicitare</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:16px 20px">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="font-size:13px;color:#666;padding:4px 0;width:140px">Domeniu juridic:</td>
                                  <td style="font-size:13px;color:#1a237e;font-weight:700;padding:4px 0">{System.Net.WebUtility.HtmlEncode(practiceArea)}</td>
                                </tr>
                                <tr>
                                  <td style="font-size:13px;color:#666;padding:4px 0">Data inregistrarii:</td>
                                  <td style="font-size:13px;color:#333;font-weight:600;padding:4px 0">{DateTime.UtcNow.ToString("dd MMMM yyyy, HH:mm", _ro)} UTC</td>
                                </tr>
                                <tr>
                                  <td style="font-size:13px;color:#666;padding:4px 0">Timp raspuns estimat:</td>
                                  <td style="font-size:13px;color:#2e7d32;font-weight:700;padding:4px 0">⏱ Maximum 24 ore lucratoare</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Next steps -->
                    <tr>
                      <td style="padding:0 40px 24px">
                        <p style="font-size:13px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px">Ce urmeaza?</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:36px;vertical-align:top;padding:0 12px 12px 0">
                              <div style="width:28px;height:28px;background:#1a237e;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:white">1</div>
                            </td>
                            <td style="vertical-align:top;padding-bottom:12px">
                              <div style="font-size:14px;font-weight:600;color:#222">Analizare solicitare</div>
                              <div style="font-size:13px;color:#666;margin-top:2px">Echipa noastra analizeaza situatia juridica descrisa</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="width:36px;vertical-align:top;padding:0 12px 12px 0">
                              <div style="width:28px;height:28px;background:#1a237e;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:white">2</div>
                            </td>
                            <td style="vertical-align:top;padding-bottom:12px">
                              <div style="font-size:14px;font-weight:600;color:#222">Contactare</div>
                              <div style="font-size:13px;color:#666;margin-top:2px">Un avocat specializat va va contacta telefonic sau pe email</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="width:36px;vertical-align:top;padding:0 12px 0 0">
                              <div style="width:28px;height:28px;background:#2e7d32;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:white">3</div>
                            </td>
                            <td style="vertical-align:top">
                              <div style="font-size:14px;font-weight:600;color:#222">Consultatie gratuita</div>
                              <div style="font-size:13px;color:#666;margin-top:2px">Prima consultatie este gratuita si fara obligatii</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Contact bar -->
                    <tr>
                      <td style="background:#f0f4ff;border-top:1px solid #e8eaf6;padding:20px 40px">
                        <p style="font-size:13px;color:#555;margin:0 0 8px;font-weight:600">Aveti intrebari urgente?</p>
                        <p style="font-size:13px;color:#666;margin:0;line-height:1.8">
                          📧 <a href="mailto:{_settings.FirmEmail}" style="color:#1a237e;text-decoration:none;font-weight:600">{_settings.FirmEmail}</a>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#1a237e;padding:20px 40px;text-align:center">
                        <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:0;line-height:1.6">
                          © {year} {_settings.FirmName}. Toate drepturile rezervate.<br/>
                          Acest email a fost trimis automat ca urmare a inregistrarii solicitarii dvs.<br/>
                          Daca nu ati completat acest formular, va rugam sa ignorati acest mesaj.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        await SendEmailAsync(toEmail, toName, subject, html, ct);
    }

    public async Task SendConsultationReminderEmailAsync(
        string toEmail, string toName, DateTime scheduledAt, string lawyerName, CancellationToken ct = default)
    {
        var dateStr = scheduledAt.ToString("dd MMMM yyyy, HH:mm", _ro);
        var year = DateTime.UtcNow.Year;
        var subject = $"⏰ Reminder consultatie — {dateStr} | {_settings.FirmName}";
        var html = $"""
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a237e 0%,#3949ab 100%);padding:36px 40px;text-align:center">
                        <div style="font-size:28px;font-weight:800;color:#ffffff">⚖️ {_settings.FirmName}</div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px">Servicii juridice profesionale</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#fff8e1;padding:18px 40px;text-align:center;border-bottom:1px solid #ffe082">
                        <span style="display:inline-block;background:#f57c00;color:white;font-size:13px;font-weight:700;padding:6px 20px;border-radius:20px">
                          ⏰ REMINDER CONSULTATIE
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:36px 40px 24px">
                        <p style="font-size:18px;font-weight:700;color:#1a237e;margin:0 0 16px">Buna ziua, {System.Net.WebUtility.HtmlEncode(toName)},</p>
                        <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px">
                          Va reamintim ca aveti o consultatie programata cu echipa <strong>{_settings.FirmName}</strong>.
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border-radius:8px;border:1px solid #c5cae9">
                          <tr><td style="padding:16px 20px;border-bottom:1px solid #c5cae9;background:#e8eaf6">
                            <span style="font-size:11px;font-weight:700;color:#1a237e;text-transform:uppercase;letter-spacing:1px">Detalii programare</span>
                          </td></tr>
                          <tr><td style="padding:16px 20px">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#666;padding:4px 0;width:140px">Data si ora:</td>
                                <td style="font-size:15px;color:#1a237e;font-weight:800;padding:4px 0">{dateStr}</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#666;padding:4px 0">Avocat:</td>
                                <td style="font-size:13px;color:#333;font-weight:600;padding:4px 0">{System.Net.WebUtility.HtmlEncode(lawyerName)}</td>
                              </tr>
                            </table>
                          </td></tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f0f4ff;border-top:1px solid #e8eaf6;padding:20px 40px">
                        <p style="font-size:13px;color:#555;margin:0 0 4px">Doriti sa reprogramati sau aveti intrebari?</p>
                        <p style="font-size:13px;color:#666;margin:0">
                          📧 <a href="mailto:{_settings.FirmEmail}" style="color:#1a237e;text-decoration:none;font-weight:600">{_settings.FirmEmail}</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#1a237e;padding:20px 40px;text-align:center">
                        <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:0">
                          © {year} {_settings.FirmName}. Toate drepturile rezervate.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        await SendEmailAsync(toEmail, toName, subject, html, ct);
    }

    public async Task SendLeadAssignedEmailAsync(
        string lawyerEmail, string lawyerName, string leadName, string practiceArea, CancellationToken ct = default)
    {
        var year = DateTime.UtcNow.Year;
        var subject = $"🔔 Lead nou asignat: {leadName} — {practiceArea}";
        var html = $"""
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a237e 0%,#3949ab 100%);padding:36px 40px;text-align:center">
                        <div style="font-size:28px;font-weight:800;color:#ffffff">⚖️ {_settings.FirmName}</div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px">Panou intern — notificare avocat</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#e3f2fd;padding:18px 40px;text-align:center;border-bottom:1px solid #90caf9">
                        <span style="display:inline-block;background:#1565c0;color:white;font-size:13px;font-weight:700;padding:6px 20px;border-radius:20px">
                          🔔 LEAD NOU ASIGNAT
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:36px 40px 24px">
                        <p style="font-size:18px;font-weight:700;color:#1a237e;margin:0 0 12px">Buna ziua, {System.Net.WebUtility.HtmlEncode(lawyerName)},</p>
                        <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px">
                          Vi-a fost asignat un lead nou care necesita contactare <strong>cat mai curand posibil</strong>.
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border-radius:8px;border:1px solid #c5cae9">
                          <tr><td style="padding:16px 20px;border-bottom:1px solid #c5cae9;background:#e8eaf6">
                            <span style="font-size:11px;font-weight:700;color:#1a237e;text-transform:uppercase;letter-spacing:1px">Detalii lead</span>
                          </td></tr>
                          <tr><td style="padding:16px 20px">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#666;padding:4px 0;width:140px">Nume client:</td>
                                <td style="font-size:14px;color:#1a237e;font-weight:700;padding:4px 0">{System.Net.WebUtility.HtmlEncode(leadName)}</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#666;padding:4px 0">Domeniu juridic:</td>
                                <td style="font-size:13px;color:#333;font-weight:600;padding:4px 0">{System.Net.WebUtility.HtmlEncode(practiceArea)}</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#666;padding:4px 0">Data asignarii:</td>
                                <td style="font-size:13px;color:#333;padding:4px 0">{DateTime.UtcNow.ToString("dd MMMM yyyy, HH:mm", _ro)} UTC</td>
                              </tr>
                            </table>
                          </td></tr>
                        </table>
                        <div style="margin-top:24px;padding:16px 20px;background:#fff8e1;border-radius:8px;border-left:4px solid #f57c00">
                          <p style="font-size:13px;color:#555;margin:0;font-weight:600">⚡ Actiune necesara</p>
                          <p style="font-size:13px;color:#666;margin:6px 0 0;line-height:1.6">
                            Contactati clientul in <strong>maximum 24 ore</strong> si inregistrati statusul in aplicatie.
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#1a237e;padding:20px 40px;text-align:center">
                        <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:0">
                          © {year} {_settings.FirmName} — Notificare interna automata
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        await SendEmailAsync(lawyerEmail, lawyerName, subject, html, ct);
    }

    public async Task SendInvoiceEmailAsync(
        string toEmail, string toName, string invoiceNumber, DateTime invoiceDate, DateTime dueDate,
        decimal totalAmount, string currency, byte[]? pdfAttachment = null, CancellationToken ct = default)
    {
        var subject = $"🧾 Factura {invoiceNumber} — {_settings.FirmName}";
        var year = DateTime.UtcNow.Year;
        var html = $"""
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Factura {System.Net.WebUtility.HtmlEncode(invoiceNumber)}</title></head>
            <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a237e 0%,#3949ab 100%);padding:36px 40px;text-align:center">
                        <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px">⚖️ {_settings.FirmName}</div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px;letter-spacing:0.5px">Servicii juridice profesionale</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#e8f5e9;padding:18px 40px;text-align:center;border-bottom:1px solid #c8e6c9">
                        <span style="display:inline-block;background:#2e7d32;color:white;font-size:13px;font-weight:700;padding:6px 20px;border-radius:20px;letter-spacing:0.5px">
                          🧾 FACTURA EMISA
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:36px 40px 0">
                        <p style="font-size:18px;font-weight:700;color:#1a237e;margin:0 0 12px">Buna ziua, {System.Net.WebUtility.HtmlEncode(toName)},</p>
                        <p style="font-size:15px;color:#444;line-height:1.7;margin:0">
                          Va transmitem factura fiscala emisa de catre <strong>{_settings.FirmName}</strong>.
                          Va rugam sa efectuati plata pana la data scadentei.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 40px">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border-radius:8px;border:1px solid #c5cae9;overflow:hidden">
                          <tr>
                            <td style="padding:16px 20px;border-bottom:1px solid #c5cae9;background:#e8eaf6">
                              <span style="font-size:11px;font-weight:700;color:#1a237e;text-transform:uppercase;letter-spacing:1px">Detalii factura</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:16px 20px">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="font-size:13px;color:#666;padding:4px 0;width:160px">Numar factura:</td>
                                  <td style="font-size:14px;color:#1a237e;font-weight:800;padding:4px 0">{System.Net.WebUtility.HtmlEncode(invoiceNumber)}</td>
                                </tr>
                                <tr>
                                  <td style="font-size:13px;color:#666;padding:4px 0">Data emiterii:</td>
                                  <td style="font-size:13px;color:#333;font-weight:600;padding:4px 0">{invoiceDate.ToString("dd MMMM yyyy", _ro)}</td>
                                </tr>
                                <tr>
                                  <td style="font-size:13px;color:#666;padding:4px 0">Data scadentei:</td>
                                  <td style="font-size:13px;color:#c62828;font-weight:700;padding:4px 0">{dueDate.ToString("dd MMMM yyyy", _ro)}</td>
                                </tr>
                                <tr>
                                  <td style="font-size:13px;color:#666;padding:4px 0">Total de plata:</td>
                                  <td style="font-size:15px;color:#1a237e;font-weight:800;padding:4px 0">{totalAmount.ToString("N2")} {System.Net.WebUtility.HtmlEncode(currency)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 40px 24px">
                        <div style="padding:16px 20px;background:#fff8e1;border-radius:8px;border-left:4px solid #f57c00">
                          <p style="font-size:13px;color:#555;margin:0;font-weight:600">📬 Intrebari despre factura?</p>
                          <p style="font-size:13px;color:#666;margin:6px 0 0;line-height:1.6">
                            Ne puteti contacta la 📧 <a href="mailto:{_settings.FirmEmail}" style="color:#1a237e;text-decoration:none;font-weight:600">{_settings.FirmEmail}</a>
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#1a237e;padding:20px 40px;text-align:center">
                        <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:0">
                          © {year} {_settings.FirmName}. Toate drepturile rezervate.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        var attachment = pdfAttachment is { Length: > 0 }
            ? ($"Factura_{invoiceNumber}.pdf", pdfAttachment)
            : ((string, byte[])?)null;
        await SendEmailAsync(toEmail, toName, subject, html, ct, attachment);
    }

    public async Task SendLeadMessageEmailAsync(
        string toEmail, string toName, string senderName, string firmName, string messageText, CancellationToken ct = default)
    {
        var subject = $"Mesaj nou de la {firmName}";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1a237e">Mesaj nou</h2>
              <p>Buna ziua, <strong>{toName}</strong>,</p>
              <p>Aveti un mesaj nou de la <strong>{senderName}</strong> ({firmName}):</p>
              <div style="background:#f5f7ff;border-left:4px solid #1a237e;padding:16px;margin:16px 0;border-radius:4px">
                <p style="margin:0;white-space:pre-wrap">{System.Net.WebUtility.HtmlEncode(messageText)}</p>
              </div>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#888;font-size:12px">{firmName}</p>
            </div>
            """;
        await SendEmailAsync(toEmail, toName, subject, html, ct);
    }
}