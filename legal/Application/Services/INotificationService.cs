namespace LegalRO.CaseManagement.Application.Services;

public interface INotificationService
{
    // Email
    Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct = default);

    // SMS
    Task SendSmsAsync(string toPhone, string message, CancellationToken ct = default);

    // Lead-specific shortcuts
    Task SendLeadConfirmationEmailAsync(string toEmail, string toName, string practiceArea, CancellationToken ct = default);
    Task SendLeadConfirmationSmsAsync(string toPhone, string toName, CancellationToken ct = default);
    Task SendConsultationReminderEmailAsync(string toEmail, string toName, DateTime scheduledAt, string lawyerName, CancellationToken ct = default);
    Task SendConsultationReminderSmsAsync(string toPhone, string toName, DateTime scheduledAt, CancellationToken ct = default);
    Task SendLeadAssignedEmailAsync(string lawyerEmail, string lawyerName, string leadName, string practiceArea, CancellationToken ct = default);
    Task SendLeadMessageEmailAsync(string toEmail, string toName, string senderName, string firmName, string messageText, CancellationToken ct = default);
}