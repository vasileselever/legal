using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Campaigns;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Enums;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// API controller for marketing campaign management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CampaignsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CampaignsController> _logger;

    public CampaignsController(ApplicationDbContext context, ILogger<CampaignsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all campaigns for the firm
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<CampaignListDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<CampaignListDto>>>> GetCampaigns(
        [FromQuery] CampaignStatus? status = null)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var query = _context.Campaigns
                .Include(c => c.Enrollments)
                .Where(c => c.FirmId == firmId)
                .AsQueryable();

            if (status.HasValue)
                query = query.Where(c => c.Status == status.Value);

            var campaigns = await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CampaignListDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Type = c.Type,
                    Status = c.Status,
                    TotalSent = c.TotalSent,
                    TotalOpened = c.TotalOpened,
                    TotalClicked = c.TotalClicked,
                    TotalConverted = c.TotalConverted,
                    OpenRate = c.TotalSent > 0 ? (decimal)c.TotalOpened / c.TotalSent * 100 : 0,
                    ClickRate = c.TotalSent > 0 ? (decimal)c.TotalClicked / c.TotalSent * 100 : 0,
                    ConversionRate = c.TotalSent > 0 ? (decimal)c.TotalConverted / c.TotalSent * 100 : 0,
                    ActiveEnrollments = c.Enrollments.Count(e => e.IsActive),
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(new ApiResponse<List<CampaignListDto>>
            {
                Success = true,
                Data = campaigns,
                Message = $"Retrieved {campaigns.Count} campaigns"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving campaigns");
            return StatusCode(500, new ApiResponse<List<CampaignListDto>> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get campaign by ID with messages
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CampaignDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CampaignDetailDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CampaignDetailDto>>> GetCampaign(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var campaign = await _context.Campaigns
                .Include(c => c.Messages)
                .Where(c => c.Id == id && c.FirmId == firmId)
                .FirstOrDefaultAsync();

            if (campaign == null)
                return NotFound(new ApiResponse<CampaignDetailDto> { Success = false, Message = "Campaign not found" });

            var dto = new CampaignDetailDto
            {
                Id = campaign.Id,
                FirmId = campaign.FirmId,
                Name = campaign.Name,
                Description = campaign.Description,
                Type = campaign.Type,
                Status = campaign.Status,
                TriggerEvent = campaign.TriggerEvent,
                PracticeAreaFilter = campaign.PracticeAreaFilter,
                TotalSent = campaign.TotalSent,
                TotalOpened = campaign.TotalOpened,
                TotalClicked = campaign.TotalClicked,
                TotalConverted = campaign.TotalConverted,
                CreatedAt = campaign.CreatedAt,
                UpdatedAt = campaign.UpdatedAt,
                Messages = campaign.Messages
                    .OrderBy(m => m.StepNumber)
                    .Select(m => new CampaignMessageDto
                    {
                        Id = m.Id,
                        StepNumber = m.StepNumber,
                        DelayDays = m.DelayDays,
                        Channel = m.Channel,
                        Subject = m.Subject ?? string.Empty,
                        Body = m.Body,
                        SentCount = m.SentCount,
                        OpenCount = m.OpenCount,
                        ClickCount = m.ClickCount
                    }).ToList()
            };

            return Ok(new ApiResponse<CampaignDetailDto> { Success = true, Data = dto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving campaign {CampaignId}", id);
            return StatusCode(500, new ApiResponse<CampaignDetailDto> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Create a new campaign
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateCampaign([FromBody] CreateCampaignDto dto)
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

            var campaign = new Campaign
            {
                FirmId = firmId,
                Name = dto.Name,
                Description = dto.Description,
                Type = dto.Type,
                Status = CampaignStatus.Draft,
                TriggerEvent = dto.TriggerEvent,
                PracticeAreaFilter = dto.PracticeAreaFilter
            };

            _context.Campaigns.Add(campaign);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Campaign created: {CampaignId} for firm {FirmId}", campaign.Id, firmId);

            return CreatedAtAction(nameof(GetCampaign), new { id = campaign.Id }, new ApiResponse<Guid>
            {
                Success = true,
                Data = campaign.Id,
                Message = "Campaign created successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating campaign");
            return StatusCode(500, new ApiResponse<Guid> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Update campaign details
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateCampaign(Guid id, [FromBody] UpdateCampaignDto dto)
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
            var campaign = await _context.Campaigns.Where(c => c.Id == id && c.FirmId == firmId).FirstOrDefaultAsync();
            if (campaign == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Campaign not found" });

            if (campaign.Status == CampaignStatus.Active)
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Cannot edit an active campaign. Pause it first." });

            if (!string.IsNullOrWhiteSpace(dto.Name)) campaign.Name = dto.Name;
            if (dto.Description != null) campaign.Description = dto.Description;
            if (dto.TriggerEvent != null) campaign.TriggerEvent = dto.TriggerEvent;
            if (dto.PracticeAreaFilter.HasValue) campaign.PracticeAreaFilter = dto.PracticeAreaFilter;

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Campaign updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating campaign {CampaignId}", id);
            return StatusCode(500, new ApiResponse<bool> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Activate a campaign (Draft ? Active)
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> ActivateCampaign(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var campaign = await _context.Campaigns
                .Include(c => c.Messages)
                .Where(c => c.Id == id && c.FirmId == firmId)
                .FirstOrDefaultAsync();

            if (campaign == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Campaign not found" });

            if (!campaign.Messages.Any())
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Campaign must have at least one message before activating" });

            if (campaign.Status == CampaignStatus.Active)
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Campaign is already active" });

            campaign.Status = CampaignStatus.Active;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Campaign activated: {CampaignId}", id);

            return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Campaign activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating campaign {CampaignId}", id);
            return StatusCode(500, new ApiResponse<bool> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Pause an active campaign
    /// </summary>
    [HttpPost("{id}/pause")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> PauseCampaign(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var campaign = await _context.Campaigns.Where(c => c.Id == id && c.FirmId == firmId).FirstOrDefaultAsync();
            if (campaign == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Campaign not found" });

            if (campaign.Status != CampaignStatus.Active)
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Only active campaigns can be paused" });

            campaign.Status = CampaignStatus.Paused;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Campaign paused successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing campaign {CampaignId}", id);
            return StatusCode(500, new ApiResponse<bool> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Delete a campaign (only Draft/Archived)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCampaign(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var campaign = await _context.Campaigns.Where(c => c.Id == id && c.FirmId == firmId).FirstOrDefaultAsync();
            if (campaign == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Campaign not found" });

            if (campaign.Status == CampaignStatus.Active)
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Cannot delete an active campaign. Pause it first." });

            campaign.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Campaign deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting campaign {CampaignId}", id);
            return StatusCode(500, new ApiResponse<bool> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Add a message step to a campaign
    /// </summary>
    [HttpPost("{id}/messages")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<Guid>>> AddMessage(Guid id, [FromBody] CreateCampaignMessageDto dto)
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
            var campaign = await _context.Campaigns
                .Include(c => c.Messages)
                .Where(c => c.Id == id && c.FirmId == firmId)
                .FirstOrDefaultAsync();

            if (campaign == null)
                return NotFound(new ApiResponse<Guid> { Success = false, Message = "Campaign not found" });

            if (campaign.Status == CampaignStatus.Active)
                return BadRequest(new ApiResponse<Guid> { Success = false, Message = "Cannot add messages to an active campaign. Pause it first." });

            // Auto-assign step number if duplicate
            if (campaign.Messages.Any(m => m.StepNumber == dto.StepNumber))
            {
                // Shift existing steps up to make room
                foreach (var existing in campaign.Messages.Where(m => m.StepNumber >= dto.StepNumber))
                    existing.StepNumber++;
            }

            var message = new CampaignMessage
            {
                CampaignId = id,
                StepNumber = dto.StepNumber,
                DelayDays = dto.DelayDays,
                Channel = dto.Channel,
                Subject = dto.Subject,
                Body = dto.Body
            };

            _context.CampaignMessages.Add(message);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCampaign), new { id }, new ApiResponse<Guid>
            {
                Success = true,
                Data = message.Id,
                Message = "Campaign message added successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding message to campaign {CampaignId}", id);
            return StatusCode(500, new ApiResponse<Guid> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Enroll a lead into a campaign
    /// </summary>
    [HttpPost("{id}/enroll/{leadId}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> EnrollLead(Guid id, Guid leadId)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);

            var campaign = await _context.Campaigns.Where(c => c.Id == id && c.FirmId == firmId).FirstOrDefaultAsync();
            if (campaign == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Campaign not found" });

            if (campaign.Status != CampaignStatus.Active)
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Can only enroll leads into active campaigns" });

            var lead = await _context.Leads.Where(l => l.Id == leadId && l.FirmId == firmId).FirstOrDefaultAsync();
            if (lead == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Lead not found" });

            var alreadyEnrolled = await _context.CampaignEnrollments
                .AnyAsync(e => e.CampaignId == id && e.LeadId == leadId && e.IsActive);

            if (alreadyEnrolled)
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Lead is already enrolled in this campaign" });

            var enrollment = new CampaignEnrollment
            {
                CampaignId = id,
                LeadId = leadId,
                IsActive = true,
                CurrentStep = 1,
                NextMessageDue = DateTime.UtcNow
            };

            _context.CampaignEnrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Lead enrolled in campaign successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enrolling lead {LeadId} in campaign {CampaignId}", leadId, id);
            return StatusCode(500, new ApiResponse<bool> { Success = false, Message = "An error occurred" });
        }
    }
}
