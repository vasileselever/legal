using LegalRO.CaseManagement.Application.Services;

namespace LegalRO.CaseManagement.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly EmailNotificationService _email;
    private readonly SmsNotificationService _sms;

    public NotificationService(
        EmailNotificationService email,
        SmsNotificationService sms)
    {
        _email = email;
        _sms = sms;
    }

    public Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct = default)
        => _email.SendEmailAsync(toEmail, toName, subject, htmlBody, ct);

    public Task SendSmsAsync(string toPhone, string message, CancellationToken ct = default)
        => _sms.SendSmsAsync(toPhone, message, ct);

    public Task SendLeadConfirmationEmailAsync(string toEmail, string toName, string practiceArea, CancellationToken ct = default)
        => _email.SendLeadConfirmationEmailAsync(toEmail, toName, practiceArea, ct);

    public Task SendLeadConfirmationSmsAsync(string toPhone, string toName, CancellationToken ct = default)
        => _sms.SendLeadConfirmationSmsAsync(toPhone, toName, ct);

    public Task SendConsultationReminderEmailAsync(string toEmail, string toName, DateTime scheduledAt, string lawyerName, CancellationToken ct = default)
        => _email.SendConsultationReminderEmailAsync(toEmail, toName, scheduledAt, lawyerName, ct);

    public Task SendConsultationReminderSmsAsync(string toPhone, string toName, DateTime scheduledAt, CancellationToken ct = default)
        => _sms.SendConsultationReminderSmsAsync(toPhone, toName, scheduledAt, ct);

    public Task SendLeadAssignedEmailAsync(string lawyerEmail, string lawyerName, string leadName, string practiceArea, CancellationToken ct = default)
        => _email.SendLeadAssignedEmailAsync(lawyerEmail, lawyerName, leadName, practiceArea, ct);

    public Task SendLeadMessageEmailAsync(string toEmail, string toName, string senderName, string firmName, string messageText, CancellationToken ct = default)
        => _email.SendLeadMessageEmailAsync(toEmail, toName, senderName, firmName, messageText, ct);
}