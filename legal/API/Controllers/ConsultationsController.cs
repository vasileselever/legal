using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.DTOs.Leads;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Enums;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Runtime.InteropServices;

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// API controller for consultation scheduling and management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConsultationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ConsultationsController> _logger;
    private readonly INotificationService _notifications;

    private static readonly TimeZoneInfo _romaniaZone = TimeZoneInfo.FindSystemTimeZoneById(
        "Europe/Bucharest");

    private static DateTime ToRomaniaLocalTime(DateTime utcTime) =>
        TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.SpecifyKind(utcTime, DateTimeKind.Utc), _romaniaZone);

    public ConsultationsController(
        ApplicationDbContext context,
        ILogger<ConsultationsController> logger,
        INotificationService notifications)
    {
        _context = context;
        _logger = logger;
        _notifications = notifications;
    }

    /// <summary>
    /// Get all consultations for the authenticated user's firm with filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ConsultationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<ConsultationDto>>>> GetConsultations(
        [FromQuery] Guid? lawyerId = null,
        [FromQuery] ConsultationStatus? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);

            var query = _context.Consultations
                .Include(c => c.Lawyer)
                .Include(c => c.Lead)
                .Where(c => c.Lead.FirmId == firmId)  // Firm isolation
                .AsQueryable();

            if (lawyerId.HasValue)
                query = query.Where(c => c.LawyerId == lawyerId.Value);
            
            if (status.HasValue)
                query = query.Where(c => c.Status == status.Value);
            
            if (startDate.HasValue)
                query = query.Where(c => c.ScheduledAt >= startDate.Value);
            
            if (endDate.HasValue)
                query = query.Where(c => c.ScheduledAt <= endDate.Value);

            var consultations = await query
                .OrderBy(c => c.ScheduledAt)
                .Select(c => new ConsultationDto
                {
                    Id = c.Id,
                    LeadId = c.LeadId,
                    LeadName  = c.Lead != null ? c.Lead.Name  : string.Empty,
                    LeadEmail = c.Lead != null ? c.Lead.Email : string.Empty,
                    LawyerId = c.LawyerId,
                    LawyerName = c.Lawyer != null ? $"{c.Lawyer.FirstName} {c.Lawyer.LastName}" : string.Empty,
                    ScheduledAt = c.ScheduledAt,
                    DurationMinutes = c.DurationMinutes,
                    Type = c.Type,
                    Status = c.Status,
                    VideoMeetingLink = c.VideoMeetingLink,
                    Location = c.Location,
                    IsConfirmed = c.IsConfirmed,
                    ConsultationNotes = c.ConsultationNotes
                })
                .ToListAsync();

            return Ok(new ApiResponse<List<ConsultationDto>>
            {
                Success = true,
                Data = consultations,
                Message = $"Retrieved {consultations.Count} consultations"
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<List<ConsultationDto>>
            {
                Success = false,
                Message = "User not associated with a firm"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving consultations");
            return StatusCode(500, new ApiResponse<List<ConsultationDto>>
            {
                Success = false,
                Message = "An error occurred while retrieving consultations"
            });
        }
    }

    /// <summary>
    /// Get consultation by ID (scoped to the user's firm)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ConsultationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ConsultationDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ConsultationDto>>> GetConsultation(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);

            var consultation = await _context.Consultations
                .Include(c => c.Lawyer)
                .Include(c => c.Lead)
                .Where(c => c.Id == id && c.Lead.FirmId == firmId)  // Firm isolation
                .Select(c => new ConsultationDto
                {
                    Id = c.Id,
                    LeadId = c.LeadId,
                    LeadName  = c.Lead != null ? c.Lead.Name  : string.Empty,
                    LeadEmail = c.Lead != null ? c.Lead.Email : string.Empty,
                    LawyerId = c.LawyerId,
                    LawyerName = c.Lawyer != null ? $"{c.Lawyer.FirstName} {c.Lawyer.LastName}" : string.Empty,
                    ScheduledAt = c.ScheduledAt,
                    DurationMinutes = c.DurationMinutes,
                    Type = c.Type,
                    Status = c.Status,
                    VideoMeetingLink = c.VideoMeetingLink,
                    Location = c.Location,
                    IsConfirmed = c.IsConfirmed,
                    ConsultationNotes = c.ConsultationNotes
                })
                .FirstOrDefaultAsync();

            if (consultation == null)
            {
                return NotFound(new ApiResponse<ConsultationDto>
                {
                    Success = false,
                    Message = "Consultation not found"
                });
            }

            return Ok(new ApiResponse<ConsultationDto>
            {
                Success = true,
                Data = consultation,
                Message = "Consultation retrieved successfully"
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<ConsultationDto>
            {
                Success = false,
                Message = "User not associated with a firm"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving consultation {ConsultationId}", id);
            return StatusCode(500, new ApiResponse<ConsultationDto>
            {
                Success = false,
                Message = "An error occurred while retrieving the consultation"
            });
        }
    }

    /// <summary>
    /// Create a new consultation (validates Lead and Lawyer belong to the user's firm)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateConsultation([FromBody] CreateConsultationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<Guid>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var userId = ClaimsHelper.GetUserId(User);

            // Validate lead belongs to the same firm
            var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == dto.LeadId && l.FirmId == firmId);
            if (lead == null)
                return BadRequest(new ApiResponse<Guid> { Success = false, Message = "Lead not found or doesn't belong to your firm" });

            // Validate lawyer belongs to the same firm
            var lawyer = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.LawyerId && u.FirmId == firmId);
            if (lawyer == null)
                return BadRequest(new ApiResponse<Guid> { Success = false, Message = "Lawyer not found or doesn't belong to your firm" });

            var hasConflict = await _context.Consultations
                .AnyAsync(c =>
                    c.LawyerId == dto.LawyerId &&
                    c.Status != ConsultationStatus.Cancelled &&
                    c.ScheduledAt < dto.ScheduledAt.AddMinutes(dto.DurationMinutes) &&
                    dto.ScheduledAt < c.ScheduledAt.AddMinutes(c.DurationMinutes));

            if (hasConflict)
                return BadRequest(new ApiResponse<Guid> { Success = false, Message = "Lawyer has a scheduling conflict at this time" });

            var consultation = new Consultation
            {
                LeadId = dto.LeadId,
                LawyerId = dto.LawyerId,
                ScheduledAt = dto.ScheduledAt,
                DurationMinutes = dto.DurationMinutes,
                Type = dto.Type,
                Status = ConsultationStatus.Scheduled,
                Location = dto.Location,
                PreparationNotes = dto.PreparationNotes
            };

            if (dto.Type == ConsultationType.Video)
                consultation.VideoMeetingLink = GenerateVideoMeetingLink();

            _context.Consultations.Add(consultation);
            lead.Status = LeadStatus.ConsultationScheduled;

            _context.LeadActivities.Add(new LeadActivity
            {
                LeadId = dto.LeadId,
                ActivityType = "ConsultationScheduled",
                Description = $"Consultation scheduled for {dto.ScheduledAt:yyyy-MM-dd HH:mm} with {lawyer.FirstName} {lawyer.LastName}",
                UserId = userId
            });

            await _context.SaveChangesAsync();

            // Send notification email to the lead if requested
            if (dto.SendNotification && !string.IsNullOrWhiteSpace(lead.Email))
            {
                try
                {
                    await _notifications.SendConsultationReminderEmailAsync(
                        toEmail: lead.Email,
                        toName: lead.Name,
                        scheduledAt: ToRomaniaLocalTime(consultation.ScheduledAt),
                        lawyerName: $"{lawyer.FirstName} {lawyer.LastName}");

                    _logger.LogInformation(
                        "Notification email sent to {Email} for consultation {Id}",
                        lead.Email, consultation.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Failed to send notification email for consultation {Id}", consultation.Id);
                }
            }

            return CreatedAtAction(nameof(GetConsultation), new { id = consultation.Id }, new ApiResponse<Guid>
            {
                Success = true,
                Data = consultation.Id,
                Message = "Consultation scheduled successfully"
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<Guid> { Success = false, Message = "User not associated with a firm" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating consultation");
            return StatusCode(500, new ApiResponse<Guid> { Success = false, Message = "An error occurred while scheduling the consultation" });
        }
    }

    /// <summary>
    /// Update consultation status (scoped to the user's firm)
    /// </summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateConsultationStatus(
        Guid id, 
        [FromBody] ConsultationStatus status)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);

            var consultation = await _context.Consultations
                .Include(c => c.Lead)
                .Where(c => c.Id == id && c.Lead.FirmId == firmId)  // Firm isolation
                .FirstOrDefaultAsync();

            if (consultation == null)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Consultation not found"
                });
            }

            var oldStatus = consultation.Status;
            consultation.Status = status;

            if (status == ConsultationStatus.Completed)
            {
                consultation.CompletedAt = DateTime.UtcNow;
                consultation.Lead.Status = LeadStatus.ConsultationCompleted;
            }
            else if (status == ConsultationStatus.NoShow)
            {
                var activity = new LeadActivity
                {
                    LeadId = consultation.LeadId,
                    ActivityType = "ConsultationNoShow",
                    Description = $"Consultation no-show on {consultation.ScheduledAt:yyyy-MM-dd HH:mm}",
                    UserId = null
                };
                _context.LeadActivities.Add(activity);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Consultation status updated: {ConsultationId} from {OldStatus} to {NewStatus}", 
                id, oldStatus, status);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Consultation status updated successfully"
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<bool> { Success = false, Message = "User not associated with a firm" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating consultation status {ConsultationId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false, Data = false,
                Message = "An error occurred while updating consultation status"
            });
        }
    }

    /// <summary>
    /// Confirm consultation attendance (scoped to the user's firm)
    /// </summary>
    [HttpPost("{id}/confirm")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> ConfirmConsultation(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);

            var consultation = await _context.Consultations
                .Include(c => c.Lead)
                .Where(c => c.Id == id && c.Lead.FirmId == firmId)  // Firm isolation
                .FirstOrDefaultAsync();

            if (consultation == null)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Consultation not found"
                });
            }

            consultation.IsConfirmed = true;
            consultation.ConfirmedAt = DateTime.UtcNow;
            consultation.Status = ConsultationStatus.Confirmed;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Consultation confirmed: {ConsultationId}", id);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Consultation confirmed successfully"
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<bool> { Success = false, Message = "User not associated with a firm" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming consultation {ConsultationId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "An error occurred while confirming the consultation"
            });
        }
    }

    /// <summary>
    /// Get lawyer availability for consultation scheduling (scoped to the user's firm)
    /// </summary>
    [HttpGet("availability/{lawyerId}")]
    [AllowAnonymous] // Allow public access for online booking
    [ProducesResponseType(typeof(ApiResponse<List<DateTime>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<DateTime>>>> GetLawyerAvailability(
        Guid lawyerId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int durationMinutes = 30)
    {
        try
        {
            // Get existing consultations for lawyer in date range
            var existingConsultations = await _context.Consultations
                .Where(c => 
                    c.LawyerId == lawyerId &&
                    c.Status != ConsultationStatus.Cancelled &&
                    c.ScheduledAt >= startDate &&
                    c.ScheduledAt <= endDate)
                .OrderBy(c => c.ScheduledAt)
                .ToListAsync();

            // Generate available time slots
            // Simple logic: 9am-5pm, Mon-Fri, in 30-min increments
            var availableSlots = new List<DateTime>();
            var currentDate = startDate.Date;

            while (currentDate <= endDate.Date)
            {
                // Skip weekends
                if (currentDate.DayOfWeek != DayOfWeek.Saturday && currentDate.DayOfWeek != DayOfWeek.Sunday)
                {
                    // Generate slots from 9am to 5pm
                    for (int hour = 9; hour < 17; hour++)
                    {
                        for (int minute = 0; minute < 60; minute += 30)
                        {
                            var slot = currentDate.AddHours(hour).AddMinutes(minute);
                            
                            // Check if slot conflicts with existing consultations
                            var hasConflict = existingConsultations.Any(c =>
                                slot < c.ScheduledAt.AddMinutes(c.DurationMinutes) &&
                                c.ScheduledAt < slot.AddMinutes(durationMinutes));

                            if (!hasConflict && slot > DateTime.UtcNow)
                            {
                                availableSlots.Add(slot);
                            }
                        }
                    }
                }

                currentDate = currentDate.AddDays(1);
            }

            return Ok(new ApiResponse<List<DateTime>>
            {
                Success = true,
                Data = availableSlots,
                Message = $"Found {availableSlots.Count} available time slots"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lawyer availability");
            return StatusCode(500, new ApiResponse<List<DateTime>>
            {
                Success = false,
                Message = "An error occurred while retrieving availability"
            });
        }
    }

    /// <summary>
    /// Update consultation details (scoped to the user's firm)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateConsultation(
        Guid id,
        [FromBody] UpdateConsultationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var userId = ClaimsHelper.GetUserId(User);

            var consultation = await _context.Consultations
                .Include(c => c.Lead)
                .Where(c => c.Id == id && c.Lead.FirmId == firmId)  // Firm isolation
                .FirstOrDefaultAsync();

            if (consultation == null)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Consultation not found"
                });
            }

            // Validate lawyer belongs to the same firm
            var lawyer = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.LawyerId && u.FirmId == firmId);
            if (lawyer == null)
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Lawyer not found or doesn't belong to your firm" });

            // Check for scheduling conflicts (excluding current consultation)
            var hasConflict = await _context.Consultations
                .AnyAsync(c =>
                    c.Id != id &&
                    c.LawyerId == dto.LawyerId &&
                    c.Status != ConsultationStatus.Cancelled &&
                    c.ScheduledAt < dto.ScheduledAt.AddMinutes(dto.DurationMinutes) &&
                    dto.ScheduledAt < c.ScheduledAt.AddMinutes(c.DurationMinutes));

            if (hasConflict)
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Lawyer has a scheduling conflict at this time" });

            // Update consultation
            consultation.LawyerId = dto.LawyerId;
            consultation.ScheduledAt = dto.ScheduledAt;
            consultation.DurationMinutes = dto.DurationMinutes;
            consultation.Type = dto.Type;
            consultation.Location = dto.Location;
            consultation.PreparationNotes = dto.PreparationNotes;

            // Update video link if type changed to Video
            if (dto.Type == ConsultationType.Video && string.IsNullOrEmpty(consultation.VideoMeetingLink))
            {
                consultation.VideoMeetingLink = GenerateVideoMeetingLink();
            }
            else if (dto.Type != ConsultationType.Video)
            {
                consultation.VideoMeetingLink = null;
            }

            // Log activity
            _context.LeadActivities.Add(new LeadActivity
            {
                LeadId = consultation.LeadId,
                ActivityType = "ConsultationUpdated",
                Description = $"Consultation rescheduled to {dto.ScheduledAt:yyyy-MM-dd HH:mm} with {lawyer.FirstName} {lawyer.LastName}",
                UserId = userId
            });

            await _context.SaveChangesAsync();

            // Send notification email to the lead if requested
            if (dto.SendNotification && !string.IsNullOrWhiteSpace(consultation.Lead?.Email))
            {
                try
                {
                    await _notifications.SendConsultationReminderEmailAsync(
                        toEmail: consultation.Lead.Email,
                        toName: consultation.Lead.Name,
                        scheduledAt: ToRomaniaLocalTime(consultation.ScheduledAt),
                        lawyerName: $"{lawyer.FirstName} {lawyer.LastName}");

                    _logger.LogInformation(
                        "Notification email sent to {Email} for consultation {Id}",
                        consultation.Lead.Email, id);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Failed to send notification email for consultation {Id}", id);
                }
            }

            _logger.LogInformation("Consultation updated: {ConsultationId} by user {UserId}", id, userId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Consultation updated successfully"
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<bool> { Success = false, Message = "User not associated with a firm" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating consultation {ConsultationId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = "An error occurred while updating the consultation"
            });
        }
    }

    /// <summary>
    /// Delete (cancel) consultation (scoped to the user's firm)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteConsultation(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var userId = ClaimsHelper.GetUserId(User);

            var consultation = await _context.Consultations
                .Include(c => c.Lead)
                .Include(c => c.Lawyer)
                .Where(c => c.Id == id && c.Lead.FirmId == firmId)  // Firm isolation
                .FirstOrDefaultAsync();

            if (consultation == null)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Consultation not found"
                });
            }

            // Soft delete: Mark as cancelled instead of deleting
            consultation.Status = ConsultationStatus.Cancelled;
            consultation.IsDeleted = true;

            // Log activity
            _context.LeadActivities.Add(new LeadActivity
            {
                LeadId = consultation.LeadId,
                ActivityType = "ConsultationCancelled",
                Description = $"Consultation cancelled: {consultation.ScheduledAt:yyyy-MM-dd HH:mm} with {consultation.Lawyer.FirstName} {consultation.Lawyer.LastName}",
                UserId = userId
            });

            // Update lead status if needed
            if (consultation.Lead.Status == LeadStatus.ConsultationScheduled)
            {
                // Check if there are other scheduled consultations for this lead
                var hasOtherConsultations = await _context.Consultations
                    .AnyAsync(c => 
                        c.LeadId == consultation.LeadId &&
                        c.Id != id &&
                        c.Status != ConsultationStatus.Cancelled &&
                        !c.IsDeleted);

                if (!hasOtherConsultations)
                {
                    // Revert lead status
                    consultation.Lead.Status = LeadStatus.Contacted;
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Consultation cancelled: {ConsultationId} by user {UserId}", id, userId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Consultation cancelled successfully"
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<bool> { Success = false, Message = "User not associated with a firm" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting consultation {ConsultationId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Data = false,
                Message = "An error occurred while cancelling the consultation"
            });
        }
    }

    #region Private Methods

    /// <summary>
    /// Generate a video meeting link (placeholder - integrate with Zoom/Teams/Meet API)
    /// </summary>
    private string GenerateVideoMeetingLink()
    {
        // TODO: Integrate with Zoom API, Teams API, or Google Meet API
        // For now, return a placeholder link
        var meetingID = Guid.NewGuid().ToString("N").Substring(0, 10);
        return $"https://meet.legalro.ro/{meetingID}";
    }

    #endregion
}
