using LegalRO.CaseManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// scheduledAt is sent as a plain local-time string "yyyy-MM-ddTHH:mm" from the datetime-local input.
/// We parse it directly — no timezone conversion needed since it already represents Romania local time.
/// </summary>
public record TestNotificationRequest(string To, string Name, string? ScheduledAt = null);

[ApiController]
[Route("api/test/notifications")]
[Authorize]
public class NotificationTestController : ControllerBase
{
    private readonly INotificationService _notifications;
    private readonly ILogger<NotificationTestController> _logger;

    public NotificationTestController(
        INotificationService notifications,
        ILogger<NotificationTestController> logger)
    {
        _notifications = notifications;
        _logger = logger;
    }

    [HttpPost("email")]
    public async Task<IActionResult> TestEmail([FromBody] TestNotificationRequest req, CancellationToken ct)
    {
        _logger.LogInformation("Test email triggered to {To}", req.To);
        await _notifications.SendLeadConfirmationEmailAsync(req.To, req.Name, "Drept Civil", ct);
        return Ok(new { message = $"Email triggered to {req.To}. Check logs if mock mode is on." });
    }

    [HttpPost("sms")]
    public async Task<IActionResult> TestSms([FromBody] TestNotificationRequest req, CancellationToken ct)
    {
        _logger.LogInformation("Test SMS triggered to {To}", req.To);
        await _notifications.SendLeadConfirmationSmsAsync(req.To, req.Name, ct);
        return Ok(new { message = $"SMS triggered to {req.To}. Check logs if mock mode is on." });
    }

    [HttpPost("consultation-reminder")]
    public async Task<IActionResult> TestConsultationReminder([FromBody] TestNotificationRequest req, CancellationToken ct)
    {
        // Parse the local-time string as-is. The frontend sends "yyyy-MM-ddTHH:mm" which is
        // already Romania local time — no timezone conversion required.
        DateTime scheduledAt;
        if (!string.IsNullOrWhiteSpace(req.ScheduledAt) &&
            DateTime.TryParse(req.ScheduledAt, CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var parsed))
        {
            scheduledAt = parsed;
        }
        else
        {
            // Fallback for the test page where no date is provided
            scheduledAt = DateTime.Now.AddDays(1);
        }

        await _notifications.SendConsultationReminderEmailAsync(
            req.To, req.Name, scheduledAt, "Av. Ion Popescu", ct);
        await _notifications.SendConsultationReminderSmsAsync(
            req.To, req.Name, scheduledAt, ct);

        return Ok(new { message = $"Consultation reminder triggered to {req.To} for {scheduledAt:dd.MM.yyyy HH:mm}." });
    }
}