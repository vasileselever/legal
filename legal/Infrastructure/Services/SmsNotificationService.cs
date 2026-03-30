using LegalRO.CaseManagement.Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Globalization;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace LegalRO.CaseManagement.Infrastructure.Services;

public class SmsNotificationService
{
    private readonly TwilioSettings _settings;
    private readonly ILogger<SmsNotificationService> _logger;
    private static readonly CultureInfo _ro = new("ro-RO");

    public SmsNotificationService(
        IOptions<NotificationSettings> options,
        ILogger<SmsNotificationService> logger)
    {
        _settings = options.Value.Twilio;
        _logger = logger;
    }

    public async Task SendSmsAsync(string toPhone, string message, CancellationToken ct = default)
    {
        if (!_settings.IsEnabled)
        {
            _logger.LogInformation("[SMS MOCK] To: {Phone} | Msg: {Msg}", toPhone, message);
            return;
        }

        try
        {
            TwilioClient.Init(_settings.AccountSid, _settings.AuthToken);

            var msg = await MessageResource.CreateAsync(
                to: new Twilio.Types.PhoneNumber(toPhone),
                from: new Twilio.Types.PhoneNumber(_settings.FromPhone),
                body: message);

            _logger.LogInformation("SMS sent to {Phone} | SID: {Sid}", toPhone, msg.Sid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {Phone}", toPhone);
        }
    }

    public async Task SendLeadConfirmationSmsAsync(string toPhone, string toName, CancellationToken ct = default)
    {
        var message = $"Buna ziua, {toName}! Am primit solicitarea dvs. Un avocat va va contacta in 24h. Cabinet LegalRO";
        await SendSmsAsync(toPhone, message, ct);
    }

    public async Task SendConsultationReminderSmsAsync(string toPhone, string toName, DateTime scheduledAt, CancellationToken ct = default)
    {
        // scheduledAt is already converted to Romania local time by the caller
        var dateStr = scheduledAt.ToString("dd.MM.yyyy HH:mm", _ro);
        var message = $"Reminder: {toName}, aveti consultatie pe {dateStr}. Info: contact@legalro.ro. Cabinet LegalRO";
        await SendSmsAsync(toPhone, message, ct);
    }
}