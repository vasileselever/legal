using LegalRO.CaseManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// Temporary diagnostic endpoint — confirms SMTP config works end-to-end.
/// Remove after email is confirmed working in production.
/// </summary>
[ApiController]
[Route("api/test")]
[AllowAnonymous]
public class TestEmailController : ControllerBase
{
    private readonly EmailNotificationService _email;
    private readonly ILogger<TestEmailController> _logger;

    public TestEmailController(EmailNotificationService email, ILogger<TestEmailController> logger)
    {
        _email = email;
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
}
