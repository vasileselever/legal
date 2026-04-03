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

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// API controller for lead management operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeadsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<LeadsController> _logger;
    private readonly INotificationService _notifications;

    public LeadsController(
        ApplicationDbContext context,
        ILogger<LeadsController> logger,
        INotificationService notifications)
    {
        _context = context;
        _logger = logger;
        _notifications = notifications;
    }

    /// <summary>
    /// Get all leads for the firm with filtering and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<LeadListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<LeadListDto>>> GetLeads(
        [FromQuery] LeadStatus? status = null,
        [FromQuery] LeadSource? source = null,
        [FromQuery] PracticeArea? practiceArea = null,
        [FromQuery] Guid? assignedTo = null,
        [FromQuery] int? minScore = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);

            // Include AssignedLawyer navigation property to ensure it's loaded
            var query = _context.Leads
                .Include(l => l.AssignedLawyer)
                .Where(l => l.FirmId == firmId)
                .AsQueryable();

            // Apply filters
            if (status.HasValue) query = query.Where(l => l.Status == status.Value);
            if (source.HasValue) query = query.Where(l => l.Source == source.Value);
            if (practiceArea.HasValue) query = query.Where(l => l.PracticeArea == practiceArea.Value);
            if (assignedTo.HasValue) query = query.Where(l => l.AssignedTo == assignedTo.Value);
            if (minScore.HasValue) query = query.Where(l => l.Score >= minScore.Value);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(l =>
                    l.Name.Contains(search) ||
                    l.Email.Contains(search) ||
                    l.Phone.Contains(search) ||
                    l.Description.Contains(search));

            // Get total count for pagination
            var totalCount = await query.CountAsync();

            // Apply pagination and sorting (newest first, then by score desc)
            var leads = await query
                .OrderByDescending(l => l.CreatedAt)
                .ThenByDescending(l => l.Score)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new LeadListDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    Email = l.Email,
                    Phone = l.Phone,
                    Source = l.Source,
                    SourceDetails = l.SourceDetails,
                    Status = l.Status,
                    Score = l.Score,
                    PracticeArea = l.PracticeArea,
                    Urgency = l.Urgency,
                    AssignedTo = l.AssignedTo,
                    AssignedToName = l.AssignedLawyer != null
                        ? l.AssignedLawyer.FirstName + " " + l.AssignedLawyer.LastName
                        : null,
                    CreatedAt = l.CreatedAt,
                    NextConsultation = l.Consultations
                        .Where(c => c.ScheduledAt > DateTime.UtcNow && (c.Status == ConsultationStatus.Scheduled || c.Status == ConsultationStatus.Confirmed))
                        .OrderBy(c => c.ScheduledAt)
                        .Select(c => c.ScheduledAt)
                        .FirstOrDefault(),
                    UnreadMessages = l.Conversations.Count(c => !c.IsRead && c.IsFromLead)
                })
                .ToListAsync();

            return Ok(new PagedResponse<LeadListDto>
            {
                Data = leads,
                Pagination = new PaginationMetadata
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leads");
            return StatusCode(500, new ApiResponse<List<LeadListDto>> { Success = false, Message = "An error occurred while retrieving leads" });
        }
    }

    /// <summary>
    /// Get lead by ID with detailed information
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LeadDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<LeadDetailDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<LeadDetailDto>>> GetLead(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var lead = await _context.Leads
                .Include(l => l.AssignedLawyer)
                .Include(l => l.Conversations)
                .Include(l => l.Consultations).ThenInclude(c => c.Lawyer)
                .Include(l => l.Activities).ThenInclude(a => a.User)
                .Include(l => l.Documents)
                .Where(l => l.Id == id && l.FirmId == firmId)
                .FirstOrDefaultAsync();

            if (lead == null)
                return NotFound(new ApiResponse<LeadDetailDto> { Success = false, Message = "Lead not found" });

            var leadDto = new LeadDetailDto
            {
                Id = lead.Id,
                FirmId = lead.FirmId,
                Name = lead.Name,
                Email = lead.Email,
                Phone = lead.Phone,
                Source = lead.Source,
                SourceDetails = lead.SourceDetails,
                Status = lead.Status,
                Score = lead.Score,
                PracticeArea = lead.PracticeArea,
                Description = lead.Description,
                Urgency = lead.Urgency,
                BudgetRange = lead.BudgetRange,
                PreferredContactMethod = lead.PreferredContactMethod,
                AssignedTo = lead.AssignedTo,
                AssignedToName = lead.AssignedLawyer != null ? $"{lead.AssignedLawyer.FirstName} {lead.AssignedLawyer.LastName}" : null,
                ConvertedToClientId = lead.ConvertedToClientId,
                ConvertedAt = lead.ConvertedAt,
                ConsentToMarketing = lead.ConsentToMarketing,
                ConsentToDataProcessing = lead.ConsentToDataProcessing,
                ConversationCount = lead.Conversations.Count,
                DocumentCount = lead.Documents.Count,
                ConsultationCount = lead.Consultations.Count,
                CreatedAt = lead.CreatedAt,
                UpdatedAt = lead.UpdatedAt,
                LastActivityAt = lead.Activities.OrderByDescending(a => a.CreatedAt).Select(a => (DateTime?)a.CreatedAt).FirstOrDefault(),
                RecentConversations = lead.Conversations
                    .OrderByDescending(c => c.MessageTimestamp).Take(10)
                    .Select(c => new LeadConversationDto
                    {
                        Id = c.Id,
                        Channel = c.Channel,
                        Message = c.Message,
                        Sender = c.Sender,
                        IsFromLead = c.IsFromLead,
                        MessageTimestamp = c.MessageTimestamp,
                        AttachmentUrl = c.AttachmentUrl,
                        IsRead = c.IsRead
                    }).ToList(),
                Consultations = lead.Consultations
                    .OrderByDescending(c => c.ScheduledAt)
                    .Select(c => new ConsultationDto
                    {
                        Id = c.Id,
                        LeadId = c.LeadId,
                        LawyerId = c.LawyerId,
                        LawyerName = $"{c.Lawyer.FirstName} {c.Lawyer.LastName}",
                        ScheduledAt = c.ScheduledAt,
                        DurationMinutes = c.DurationMinutes,
                        Type = c.Type,
                        Status = c.Status,
                        VideoMeetingLink = c.VideoMeetingLink,
                        Location = c.Location,
                        IsConfirmed = c.IsConfirmed,
                        ConsultationNotes = c.ConsultationNotes
                    }).ToList(),
                Activities = lead.Activities
                    .OrderByDescending(a => a.CreatedAt).Take(20)
                    .Select(a => new LeadActivityDto
                    {
                        Id = a.Id,
                        ActivityType = a.ActivityType,
                        Description = a.Description,
                        UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : null,
                        CreatedAt = a.CreatedAt
                    }).ToList()
            };

            return Ok(new ApiResponse<LeadDetailDto> { Success = true, Data = leadDto, Message = "Lead retrieved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<LeadDetailDto> { Success = false, Message = "An error occurred while retrieving the lead" });
        }
    }

    /// <summary>
    /// Create a new lead. Returns the new lead ID plus any prior leads found for the same contact.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<CreateLeadResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<CreateLeadResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<CreateLeadResponseDto>>> CreateLead([FromBody] CreateLeadDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<CreateLeadResponseDto>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

        try
        {
            // Use authenticated firm if available, otherwise fall back to header/default
            Guid firmId;
            if (ClaimsHelper.TryGetFirmId(User, out var claimFirmId))
                firmId = claimFirmId;
            else if (Request.Headers.TryGetValue("X-Firm-Id", out var headerFirmId) && Guid.TryParse(headerFirmId, out var parsedFirmId))
                firmId = parsedFirmId;
            else
                return BadRequest(new ApiResponse<CreateLeadResponseDto> { Success = false, Message = "Firm identifier is required" });

            var lead = new Lead
            {
                FirmId = firmId,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Source = dto.Source,
                SourceDetails = dto.SourceDetails,
                Status = LeadStatus.New,
                PracticeArea = dto.PracticeArea,
                Description = dto.Description,
                Urgency = dto.Urgency,
                BudgetRange = dto.BudgetRange,
                PreferredContactMethod = dto.PreferredContactMethod,
                AssignedTo = dto.AssignedTo,
                ConsentToMarketing = dto.ConsentToMarketing,
                ConsentToDataProcessing = dto.ConsentToDataProcessing,
                ConsentDate = dto.ConsentToDataProcessing ? DateTime.UtcNow : null,
                CustomFieldsJson = dto.CustomFieldsJson,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
            };

            // Calculate initial lead score
            lead.Score = CalculateLeadScore(lead);
            _context.Leads.Add(lead);

            // Create initial activity
            var activity = new LeadActivity
            {
                LeadId = lead.Id,
                ActivityType = "LeadCreated",
                Description = $"Lead created from {dto.Source}",
                Metadata = $"{{\"Source\":\"{dto.Source}\",\"PracticeArea\":\"{dto.PracticeArea}\"}}"
            };
            _context.LeadActivities.Add(activity);

            // Perform automatic conflict check
            await PerformConflictCheck(lead);
            await _context.SaveChangesAsync();

            // Find prior leads from same person (same email or phone, different lead ID)
            var priorLeads = await _context.Leads
                .Include(l => l.AssignedLawyer)
                .Where(l => l.FirmId == firmId
                         && l.Id != lead.Id
                         && (l.Email == dto.Email || l.Phone == dto.Phone))
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new PriorLeadDto
                {
                    Id = l.Id,
                    PracticeArea = l.PracticeArea,
                    Status = l.Status,
                    CreatedAt = l.CreatedAt,
                    AssignedToName = l.AssignedLawyer != null
                        ? l.AssignedLawyer.FirstName + " " + l.AssignedLawyer.LastName
                        : null
                })
                .ToListAsync();

            // Send confirmation email (fire-and-forget)
            _ = _notifications.SendLeadConfirmationEmailAsync(
                lead.Email, lead.Name, lead.PracticeArea.ToRomanianLabel());

            _logger.LogInformation("Lead created: {LeadId} for firm {FirmId}. Prior leads: {Count}", lead.Id, firmId, priorLeads.Count);

            return CreatedAtAction(nameof(GetLead), new { id = lead.Id }, new ApiResponse<CreateLeadResponseDto>
            {
                Success = true,
                Data = new CreateLeadResponseDto { LeadId = lead.Id, PriorLeads = priorLeads },
                Message = priorLeads.Count > 0
                    ? $"Lead creat. Atentie: {priorLeads.Count} lead(uri) anterioare gasite pentru acelasi contact."
                    : "Lead created successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lead");
            return StatusCode(500, new ApiResponse<CreateLeadResponseDto> { Success = false, Message = "An error occurred while creating the lead" });
        }
    }

    /// <summary>
    /// Update an existing lead
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateLead(Guid id, [FromBody] UpdateLeadDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<bool> { Success = false, Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });

        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var userId = ClaimsHelper.GetUserId(User);

            var lead = await _context.Leads.Where(l => l.Id == id && l.FirmId == firmId).FirstOrDefaultAsync();
            if (lead == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Lead not found" });

            var oldStatus = lead.Status;
            var changes = new List<string>();

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name != lead.Name) { lead.Name = dto.Name; changes.Add("Name"); }
            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != lead.Email) { lead.Email = dto.Email; changes.Add("Email"); }
            if (!string.IsNullOrWhiteSpace(dto.Phone) && dto.Phone != lead.Phone) { lead.Phone = dto.Phone; changes.Add("Phone"); }
            if (dto.Status.HasValue && dto.Status.Value != lead.Status) { lead.Status = dto.Status.Value; changes.Add($"Status: {oldStatus}?{dto.Status.Value}"); }
            if (dto.PracticeArea.HasValue && dto.PracticeArea.Value != lead.PracticeArea) { lead.PracticeArea = dto.PracticeArea.Value; changes.Add("PracticeArea"); }
            if (!string.IsNullOrWhiteSpace(dto.Description)) { lead.Description = dto.Description; changes.Add("Description"); }
            if (dto.Urgency.HasValue && dto.Urgency.Value != lead.Urgency) { lead.Urgency = dto.Urgency.Value; changes.Add("Urgency"); }
            if (dto.BudgetRange != null && dto.BudgetRange != lead.BudgetRange) { lead.BudgetRange = dto.BudgetRange; changes.Add("BudgetRange"); }
            if (dto.AssignedTo != lead.AssignedTo) { lead.AssignedTo = dto.AssignedTo; changes.Add("Assigned"); }
            if (dto.Score.HasValue && dto.Score.Value != lead.Score) { lead.Score = dto.Score.Value; changes.Add("Score"); }

            if (changes.Any())
            {
                // Create activity for changes
                var activity = new LeadActivity
                {
                    LeadId = lead.Id,
                    ActivityType = "LeadUpdated",
                    Description = $"Lead updated: {string.Join(", ", changes)}",
                    UserId = userId
                };
                _context.LeadActivities.Add(activity);

                await _context.SaveChangesAsync();
                _logger.LogInformation("Lead updated: {LeadId}, Changes: {Changes}", id, string.Join(", ", changes));

                return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Lead updated successfully" });
            }

            return Ok(new ApiResponse<bool> { Success = true, Data = false, Message = "No changes detected" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<bool> { Success = false, Message = "An error occurred while updating the lead" });
        }
    }

    /// <summary>
    /// Delete a lead (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteLead(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var lead = await _context.Leads.Where(l => l.Id == id && l.FirmId == firmId).FirstOrDefaultAsync();
            if (lead == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Lead not found" });

            lead.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Lead deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<bool> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get lead statistics for dashboard
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<LeadStatisticsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<LeadStatisticsDto>>> GetStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var query = _context.Leads.Where(l => l.FirmId == firmId);
            if (startDate.HasValue) query = query.Where(l => l.CreatedAt >= startDate.Value);
            if (endDate.HasValue) query = query.Where(l => l.CreatedAt <= endDate.Value);

            var totalLeads = await query.CountAsync();
            var convertedLeads = await query.CountAsync(l => l.Status == LeadStatus.Converted);

            var statistics = new LeadStatisticsDto
            {
                TotalLeads = totalLeads,
                NewLeads = await query.CountAsync(l => l.Status == LeadStatus.New),
                QualifiedLeads = await query.CountAsync(l => l.Status == LeadStatus.Qualified),
                ConsultationsScheduled = await query.CountAsync(l => l.Status == LeadStatus.ConsultationScheduled),
                ConvertedLeads = convertedLeads,
                LostLeads = await query.CountAsync(l => l.Status == LeadStatus.Lost),
                ConversionRate = totalLeads > 0 ? (decimal)convertedLeads / totalLeads * 100 : 0,
                AverageScore = (decimal)(await query.AverageAsync(l => (double?)l.Score) ?? 0),
                LeadsBySource = await query.GroupBy(l => l.Source).Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Key, x => x.Count),
                LeadsByPracticeArea = await query.GroupBy(l => l.PracticeArea).Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Key, x => x.Count)
            };

            return Ok(new ApiResponse<LeadStatisticsDto> { Success = true, Data = statistics, Message = "Statistics retrieved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lead statistics");
            return StatusCode(500, new ApiResponse<LeadStatisticsDto> { Success = false, Message = "An error occurred while retrieving statistics" });
        }
    }

    /// <summary>
    /// Convert a lead to a client
    /// </summary>
    [HttpPost("{id}/convert")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<Guid>>> ConvertToClient(Guid id, [FromBody] ConvertToClientDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<Guid> { Success = false, Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });

        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var userId = ClaimsHelper.GetUserId(User);

            var lead = await _context.Leads.Where(l => l.Id == id && l.FirmId == firmId).FirstOrDefaultAsync();
            if (lead == null)
                return NotFound(new ApiResponse<Guid> { Success = false, Message = "Lead not found" });

            if (lead.ConvertedToClientId.HasValue)
                return BadRequest(new ApiResponse<Guid> { Success = false, Message = "Lead has already been converted to a client" });

            var client = new Client { FirmId = firmId, Name = dto.ClientName, Email = dto.ClientEmail ?? lead.Email, Phone = dto.ClientPhone ?? lead.Phone };
            _context.Clients.Add(client);

            lead.Status = LeadStatus.Converted;
            lead.ConvertedToClientId = client.Id;
            lead.ConvertedAt = DateTime.UtcNow;

            _context.LeadActivities.Add(new LeadActivity
            {
                LeadId = lead.Id,
                ActivityType = "ConvertedToClient",
                Description = $"Lead converted to client: {dto.ClientName}",
                UserId = userId,
                Metadata = $"{{\"ClientId\":\"{client.Id}\"}}"
            });

            await _context.SaveChangesAsync();
            _logger.LogInformation("Lead {LeadId} converted to client {ClientId}", id, client.Id);

            return Ok(new ApiResponse<Guid> { Success = true, Data = client.Id, Message = "Lead converted to client successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<Guid> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get conversations for a lead
    /// </summary>
    [HttpGet("{id}/conversations")]
    [ProducesResponseType(typeof(ApiResponse<List<LeadConversationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<LeadConversationDto>>>> GetConversations(Guid id)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var leadExists = await _context.Leads.AnyAsync(l => l.Id == id && l.FirmId == firmId);
            if (!leadExists)
                return NotFound(new ApiResponse<List<LeadConversationDto>> { Success = false, Message = "Lead not found" });

            var conversations = await _context.LeadConversations
                .Where(c => c.LeadId == id)
                .OrderBy(c => c.MessageTimestamp)
                .Select(c => new LeadConversationDto
                {
                    Id = c.Id,
                    Channel = c.Channel,
                    Message = c.Message,
                    Sender = c.Sender,
                    IsFromLead = c.IsFromLead,
                    MessageTimestamp = c.MessageTimestamp,
                    AttachmentUrl = c.AttachmentUrl,
                    IsRead = c.IsRead
                })
                .ToListAsync();

            // Mark all unread messages as read
            await _context.LeadConversations
                .Where(c => c.LeadId == id && !c.IsRead && c.IsFromLead)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.IsRead, true));

            return Ok(new ApiResponse<List<LeadConversationDto>> { Success = true, Data = conversations, Message = $"Retrieved {conversations.Count} messages" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving conversations for lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<List<LeadConversationDto>> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Send a message to a lead
    /// </summary>
    [HttpPost("{id}/conversations")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<Guid>>> SendMessage(Guid id, [FromBody] CreateLeadMessageDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<Guid> { Success = false, Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });

        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var userId = ClaimsHelper.GetUserId(User);

            var lead = await _context.Leads.Where(l => l.Id == id && l.FirmId == firmId).FirstOrDefaultAsync();
            if (lead == null)
                return NotFound(new ApiResponse<Guid> { Success = false, Message = "Lead not found" });

            var user = await _context.Users.FindAsync(userId);

            var message = new LeadConversation
            {
                LeadId = id,
                Channel = dto.Channel,
                Message = dto.Message,
                Sender = user != null ? $"{user.FirstName} {user.LastName}" : "Firm",
                IsFromLead = false,
                AttachmentUrl = dto.AttachmentUrl,
                IsRead = true
            };
            _context.LeadConversations.Add(message);

            // Update lead status to Contacted if still New
            if (lead.Status == LeadStatus.New)
            {
                lead.Status = LeadStatus.Contacted;
                _context.LeadActivities.Add(new LeadActivity
                {
                    LeadId = id,
                    ActivityType = "MessageSent",
                    Description = $"Message sent via {dto.Channel}",
                    UserId = userId
                });
            }

            await _context.SaveChangesAsync();

            // TODO: Actually deliver message via WhatsApp API / SendGrid / Twilio

            return CreatedAtAction(nameof(GetConversations), new { id }, new ApiResponse<Guid>
            {
                Success = true,
                Data = message.Id,
                Message = "Message sent successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message to lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<Guid> { Success = false, Message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get full activity history for a lead (paginated)
    /// </summary>
    [HttpGet("{id}/history")]
    [ProducesResponseType(typeof(PagedResponse<LeadActivityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<LeadActivityDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResponse<LeadActivityDto>>> GetLeadHistory(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);

            var leadExists = await _context.Leads.AnyAsync(l => l.Id == id && l.FirmId == firmId);
            if (!leadExists)
                return NotFound(new ApiResponse<LeadActivityDto> { Success = false, Message = "Lead not found" });

            var query = _context.LeadActivities
                .Include(a => a.User)
                .Where(a => a.LeadId == id)
                .OrderByDescending(a => a.CreatedAt);

            var totalCount = await query.CountAsync();

            var activities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new LeadActivityDto
                {
                    Id = a.Id,
                    ActivityType = a.ActivityType,
                    Description = a.Description,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : null,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return Ok(new PagedResponse<LeadActivityDto>
            {
                Data = activities,
                Pagination = new PaginationMetadata
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving history for lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<LeadActivityDto> { Success = false, Message = "An error occurred while retrieving lead history" });
        }
    }

    /// <summary>
    /// Look up existing leads by email or phone (for duplicate/returning-contact detection in the UI).
    /// Returns a lightweight list — safe to call before creating a new lead.
    /// </summary>
    [HttpGet("lookup")]
    [ProducesResponseType(typeof(ApiResponse<List<PriorLeadDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<PriorLeadDto>>>> LookupByContact(
        [FromQuery] string? email = null,
        [FromQuery] string? phone = null)
    {
        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(phone))
            return BadRequest(new ApiResponse<List<PriorLeadDto>> { Success = false, Message = "Provide email or phone" });

        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);

            var query = _context.Leads
                .Include(l => l.AssignedLawyer)
                .Where(l => l.FirmId == firmId);

            if (!string.IsNullOrWhiteSpace(email) && !string.IsNullOrWhiteSpace(phone))
                query = query.Where(l => l.Email == email || l.Phone == phone);
            else if (!string.IsNullOrWhiteSpace(email))
                query = query.Where(l => l.Email == email);
            else
                query = query.Where(l => l.Phone == phone);

            var results = await query
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new PriorLeadDto
                {
                    Id = l.Id,
                    PracticeArea = l.PracticeArea,
                    Status = l.Status,
                    CreatedAt = l.CreatedAt,
                    AssignedToName = l.AssignedLawyer != null
                        ? l.AssignedLawyer.FirstName + " " + l.AssignedLawyer.LastName
                        : null
                })
                .ToListAsync();

            return Ok(new ApiResponse<List<PriorLeadDto>> { Success = true, Data = results, Message = $"{results.Count} lead(uri) gasite" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error looking up leads by contact");
            return StatusCode(500, new ApiResponse<List<PriorLeadDto>> { Success = false, Message = "An error occurred" });
        }
    }

    #region Private Methods

    /// <summary>
    /// Calculate lead score based on various factors (0-100)
    /// </summary>
    private int CalculateLeadScore(Lead lead)
    {
        int score = 0;

        // Urgency scoring (0-40 points)
        score += lead.Urgency switch
        {
            LeadUrgency.Emergency => 40,
            LeadUrgency.High => 30,
            LeadUrgency.Medium => 15,
            LeadUrgency.Low => 5,
            _ => 0
        };

        // Budget alignment (0-30 points)
        if (!string.IsNullOrWhiteSpace(lead.BudgetRange))
        {
            // Parse budget range and assign points
            // Simple logic: if budget mentioned, give points
            score += 20;
        }

        // Complete information (0-20 points)
        if (!string.IsNullOrWhiteSpace(lead.Name)) score += 5;
        if (!string.IsNullOrWhiteSpace(lead.Email)) score += 5;
        if (!string.IsNullOrWhiteSpace(lead.Phone)) score += 5;
        if (!string.IsNullOrWhiteSpace(lead.Description) && lead.Description.Length > 50) score += 5;

        // Lead source quality (0-10 points)
        score += lead.Source switch
        {
            LeadSource.Referral => 10,
            LeadSource.Website => 7,
            LeadSource.GoogleAds => 5,
            LeadSource.Facebook => 3,
            _ => 0
        };

        // Ensure score is between 0-100
        return Math.Min(100, Math.Max(0, score));
    }

    /// <summary>
    /// Perform automatic conflict of interest check.
    /// - Matching an existing CLIENT by email ? DirectConflict (firm already represents this person)
    /// - Matching a prior LEAD by email/phone ? RelatedParty (returning contact, different matter)
    /// Multiple leads from the same person are the same are NOT a conflict.
    /// </summary>
    private async Task PerformConflictCheck(Lead lead)
    {
        // 1. Check against existing clients (real conflict risk)
        var existingClient = await _context.Clients
            .Where(c => c.FirmId == lead.FirmId && c.Email == lead.Email)
            .FirstOrDefaultAsync();

        if (existingClient != null)
        {
            _context.ConflictChecks.Add(new ConflictCheck
            {
                LeadId = lead.Id,
                Status = ConflictCheckStatus.ConflictDetected,
                ConflictType = ConflictType.DirectConflict,
                ConflictDescription = "Email matches an existing client — verify there is no conflict of interest before proceeding",
                ConflictingClientId = existingClient.Id
            });
            return; // Direct conflict takes precedence
        }

        // 2. Check against prior leads from the same person.
        //    This is NOT a conflict — the same person can have multiple matters.
        //    We flag it as RelatedParty so staff are aware, but it does not block the lead.
        var priorLead = await _context.Leads
            .Where(l => l.FirmId == lead.FirmId
                     && l.Id != lead.Id
                     && (l.Email == lead.Email || l.Phone == lead.Phone))
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync();

        if (priorLead != null)
        {
            _context.ConflictChecks.Add(new ConflictCheck
            {
                LeadId = lead.Id,
                Status = ConflictCheckStatus.NoConflict, // Not a conflict — same person, new matter
                ConflictType = ConflictType.RelatedParty,
                ConflictDescription = $"Returning contact — has {priorLead.PracticeArea.ToRomanianLabel()} lead from {priorLead.CreatedAt:dd MMM yyyy}. Multiple matters from the same person are allowed."
            });
            return;
        }

        // 3. No conflict found
        _context.ConflictChecks.Add(new ConflictCheck
        {
            LeadId = lead.Id,
            Status = ConflictCheckStatus.NoConflict
        });
    }

    #endregion

    #region Documents

    /// <summary>
    /// List all documents attached to a lead
    /// </summary>
    [HttpGet("{id}/documents")]
    public async Task<ActionResult<ApiResponse<List<LeadDocumentDto>>>> GetDocuments(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id && l.FirmId == firmId);
        if (lead == null) return NotFound(new ApiResponse<List<LeadDocumentDto>> { Success = false, Message = "Lead not found" });

        var docs = await _context.LeadDocuments
            .Where(d => d.LeadId == id)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new LeadDocumentDto
            {
                Id = d.Id,
                FileName = d.FileName,
                FilePath = d.FilePath,
                FileSize = d.FileSize,
                FileType = d.FileType,
                Description = d.Description,
                CreatedAt = d.CreatedAt
            })
            .ToListAsync();

        return Ok(new ApiResponse<List<LeadDocumentDto>> { Success = true, Data = docs });
    }

    /// <summary>
    /// Upload a document and attach it to a lead
    /// </summary>
    [HttpPost("{id}/documents")]
    [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB
    public async Task<ActionResult<ApiResponse<LeadDocumentDto>>> UploadDocument(
        Guid id, IFormFile file, [FromForm] string? description = null)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id && l.FirmId == firmId);
        if (lead == null) return NotFound(new ApiResponse<LeadDocumentDto> { Success = false, Message = "Lead not found" });

        if (file == null || file.Length == 0)
            return BadRequest(new ApiResponse<LeadDocumentDto> { Success = false, Message = "No file provided" });

        var uploadsDir = Path.Combine("uploads", "leads", id.ToString());
        Directory.CreateDirectory(uploadsDir);

        var safeFileName = Path.GetFileName(file.FileName);
        var uniqueName = $"{Guid.NewGuid()}_{safeFileName}";
        var filePath = Path.Combine(uploadsDir, uniqueName);

        using (var stream = System.IO.File.Create(filePath))
            await file.CopyToAsync(stream);

        var doc = new LeadDocument
        {
            LeadId = id,
            FileName = safeFileName,
            FilePath = filePath,
            FileSize = file.Length,
            FileType = file.ContentType,
            Description = description
        };

        _context.LeadDocuments.Add(doc);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Document uploaded for lead {LeadId}: {FileName}", id, safeFileName);

        return Ok(new ApiResponse<LeadDocumentDto>
        {
            Success = true,
            Data = new LeadDocumentDto
            {
                Id = doc.Id, FileName = doc.FileName, FilePath = doc.FilePath,
                FileSize = doc.FileSize, FileType = doc.FileType,
                Description = doc.Description, CreatedAt = doc.CreatedAt
            }
        });
    }

    /// <summary>
    /// Download a lead document
    /// </summary>
    [HttpGet("{id}/documents/{docId}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id, Guid docId)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id && l.FirmId == firmId);
        if (lead == null) return NotFound();

        var doc = await _context.LeadDocuments.FirstOrDefaultAsync(d => d.Id == docId && d.LeadId == id);
        if (doc == null) return NotFound();

        if (!System.IO.File.Exists(doc.FilePath)) return NotFound("File not found on disk");

        var bytes = await System.IO.File.ReadAllBytesAsync(doc.FilePath);
        return File(bytes, doc.FileType ?? "application/octet-stream", doc.FileName);
    }

    /// <summary>
    /// Delete a document from a lead
    /// </summary>
    [HttpDelete("{id}/documents/{docId}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteDocument(Guid id, Guid docId)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id && l.FirmId == firmId);
        if (lead == null) return NotFound(new ApiResponse<bool> { Success = false, Message = "Lead not found" });

        var doc = await _context.LeadDocuments.FirstOrDefaultAsync(d => d.Id == docId && d.LeadId == id);
        if (doc == null) return NotFound(new ApiResponse<bool> { Success = false, Message = "Document not found" });

        if (System.IO.File.Exists(doc.FilePath))
            System.IO.File.Delete(doc.FilePath);

        _context.LeadDocuments.Remove(doc);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<bool> { Success = true, Data = true });
    }

    #endregion
}
