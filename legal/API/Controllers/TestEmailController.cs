using LegalRO.CaseManagement.Infrastructure.Services;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

public record TestNotificationRequest(string To, string Name, DateTime? ScheduledAt);

/// <summary>
/// Diagnostic endpoints — confirm SMTP/SMS config works end-to-end.
/// Remove after notifications are confirmed working in production.
/// </summary>
[ApiController]
[Route("api/test")]
[AllowAnonymous]
public class TestEmailController : ControllerBase
{
    private readonly EmailNotificationService _email;
    private readonly INotificationService _notifications;
    private readonly ILogger<TestEmailController> _logger;

    public TestEmailController(
        EmailNotificationService email,
        INotificationService notifications,
        ILogger<TestEmailController> logger)
    {
        _email = email;
        _notifications = notifications;
        _logger = logger;
    }

    /// <summary>
    /// POST /api/test/email?to=you@example.com
    /// Sends a plain test email directly via the configured SMTP/SendGrid.
    /// </summary>
    [HttpPost("email")]
    public async Task<IActionResult> SendTestEmail([FromQuery] string to)
    {
        if (string.IsNullOrWhiteSpace(to))
            return BadRequest("Provide to=email@example.com as query param");

        try
        {
            await _email.SendEmailAsync(
                toEmail: to,
                toName: "Test",
                subject: "LegalRO SMTP Test",
                htmlBody: "<h2>SMTP works!</h2><p>Email sent at " + DateTime.UtcNow.ToString("u") + "</p>");

            _logger.LogInformation("[TestEmail] Sent to {To}", to);
            return Ok(new { success = true, message = $"Email sent to {to}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[TestEmail] Failed to {To}", to);
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// POST /api/test/notifications/email — sends a lead confirmation email
    /// </summary>
    [HttpPost("notifications/email")]
    public async Task<IActionResult> SendTestNotificationEmail([FromBody] TestNotificationRequest req)
    {
        try
        {
            await _notifications.SendLeadConfirmationEmailAsync(req.To, req.Name, "General");
            _logger.LogInformation("[TestNotification] Email sent to {To}", req.To);
            return Ok(new { message = $"Email notification sent to {req.To}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[TestNotification] Email failed to {To}", req.To);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// POST /api/test/notifications/sms — sends a lead confirmation SMS
    /// </summary>
    [HttpPost("notifications/sms")]
    public async Task<IActionResult> SendTestNotificationSms([FromBody] TestNotificationRequest req)
    {
        try
        {
            await _notifications.SendLeadConfirmationSmsAsync(req.To, req.Name);
            _logger.LogInformation("[TestNotification] SMS sent to {To}", req.To);
            return Ok(new { message = $"SMS notification sent to {req.To}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[TestNotification] SMS failed to {To}", req.To);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// POST /api/test/notifications/consultation-reminder — sends a consultation reminder
    /// </summary>
    [HttpPost("notifications/consultation-reminder")]
    public async Task<IActionResult> SendTestConsultationReminder([FromBody] TestNotificationRequest req)
    {
        var scheduledAt = req.ScheduledAt ?? DateTime.UtcNow.AddDays(1);
        try
        {
            await _notifications.SendConsultationReminderEmailAsync(req.To, req.Name, scheduledAt, "Avocat LegalRO");
            _logger.LogInformation("[TestNotification] Consultation reminder sent to {To}", req.To);
            return Ok(new { message = $"Consultation reminder sent to {req.To} for {scheduledAt:yyyy-MM-dd HH:mm}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[TestNotification] Consultation reminder failed to {To}", req.To);
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
