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

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct = default)
    {
        if (_settings.Smtp is { IsEnabled: true })
        {
            await SendViaSmtpAsync(toEmail, toName, subject, htmlBody, ct);
        }
        else if (_settings.SendGrid.IsEnabled)
        {
            await SendViaSendGridAsync(toEmail, toName, subject, htmlBody, ct);
        }
        else
        {
            _logger.LogInformation("[Email MOCK] To: {To} | Subject: {Subject}", toEmail, subject);
        }
    }

    private async Task SendViaSmtpAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FirmName, _settings.FirmEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

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

    private async Task SendViaSendGridAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct)
    {
        try
        {
            var client = new SendGridClient(_settings.SendGrid.ApiKey);
            var from = new EmailAddress(_settings.SendGrid.FromEmail, _settings.SendGrid.FromName);
            var to = new EmailAddress(toEmail, toName);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlBody);

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
        var subject = "Am primit solicitarea dvs. - Cabinet Avocat LegalRO";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1a237e">Multumim, {toName}!</h2>
              <p>Am primit solicitarea dvs. pentru <strong>{practiceArea}</strong>.</p>
              <p>Un avocat va va contacta in cel mai scurt timp, de regula in <strong>24 de ore lucratoare</strong>.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#888;font-size:12px">Cabinet Avocat LegalRO &bull; contact@legalro.ro</p>
            </div>
            """;

        await SendEmailAsync(toEmail, toName, subject, html, ct);
    }

    public async Task SendConsultationReminderEmailAsync(
        string toEmail, string toName, DateTime scheduledAt, string lawyerName, CancellationToken ct = default)
    {
        var dateStr = scheduledAt.ToString("dd MMMM yyyy, HH:mm", _ro);
        var subject = $"Reminder consultatie - {dateStr}";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1a237e">Reminder consultatie</h2>
              <p>Buna ziua, <strong>{toName}</strong>,</p>
              <p>Va reamintim ca aveti o consultatie programata cu <strong>{lawyerName}</strong>
                 pe data de <strong>{dateStr}</strong>.</p>
              <p>Daca doriti sa reprogramati, va rugam sa ne contactati la contact@legalro.ro.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#888;font-size:12px">Cabinet Avocat LegalRO</p>
            </div>
            """;

        await SendEmailAsync(toEmail, toName, subject, html, ct);
    }

    public async Task SendLeadAssignedEmailAsync(
        string lawyerEmail, string lawyerName, string leadName, string practiceArea, CancellationToken ct = default)
    {
        var subject = $"Lead nou asignat: {leadName}";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1a237e">Lead nou asignat</h2>
              <p>Buna ziua, <strong>{lawyerName}</strong>,</p>
              <p>V-a fost asignat un lead nou:</p>
              <ul>
                <li><strong>Nume:</strong> {leadName}</li>
                <li><strong>Domeniu:</strong> {practiceArea}</li>
              </ul>
              <p>Va rugam sa il contactati cat mai curand posibil.</p>
            </div>
            """;

        await SendEmailAsync(lawyerEmail, lawyerName, subject, html, ct);
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