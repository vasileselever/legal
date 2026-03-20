using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.DTOs.Leads;
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

    public LeadsController(ApplicationDbContext context, ILogger<LeadsController> logger)
    {
        _context = context;
        _logger = logger;
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
            var query = _context.Leads.Where(l => l.FirmId == firmId).AsQueryable();

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

            // Apply pagination and sorting (by score desc, then created desc)
            var leads = await query
                .OrderByDescending(l => l.Score)
                .ThenByDescending(l => l.CreatedAt)
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
                    AssignedToName = l.AssignedLawyer != null
                        ? l.AssignedLawyer.FirstName + " " + l.AssignedLawyer.LastName
                        : null,
                    CreatedAt = l.CreatedAt,
                    NextConsultation = l.Consultations
                        .Where(c => c.ScheduledAt > DateTime.UtcNow && c.Status == ConsultationStatus.Scheduled)
                        .OrderBy(c => c.ScheduledAt)
                        .Select(c => c.ScheduledAt)
                        .FirstOrDefault(),
                    UnreadMessages = l.Conversations.Count(c => !c.IsRead && c.IsFromLead)
                })
                .ToListAsync();

            var response = new PagedResponse<LeadListDto>
            {
                Data = leads,
                Pagination = new PaginationMetadata
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leads");
            return StatusCode(500, new ApiResponse<List<LeadListDto>>
            {
                Success = false,
                Message = "An error occurred while retrieving leads"
            });
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
            {
                return NotFound(new ApiResponse<LeadDetailDto>
                {
                    Success = false,
                    Message = "Lead not found"
                });
            }

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

            return Ok(new ApiResponse<LeadDetailDto>
            {
                Success = true,
                Data = leadDto,
                Message = "Lead retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<LeadDetailDto>
            {
                Success = false,
                Message = "An error occurred while retrieving the lead"
            });
        }
    }

    /// <summary>
    /// Create a new lead
    /// </summary>
    [HttpPost]
    [AllowAnonymous] // Allow public intake form submissions
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateLead([FromBody] CreateLeadDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<Guid>
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
                return BadRequest(new ApiResponse<Guid> { Success = false, Message = "Firm identifier is required" });

            // Validate email and phone uniqueness for this firm
            var existingLead = await _context.Leads
                .Where(l => l.FirmId == firmId && (l.Email == dto.Email || l.Phone == dto.Phone))
                .FirstOrDefaultAsync();

            if (existingLead != null)
                return BadRequest(new ApiResponse<Guid>
                {
                    Success = false,
                    Message = "A lead with this email or phone already exists"
                });

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

            _logger.LogInformation("Lead created: {LeadId} for firm {FirmId}", lead.Id, firmId);

            return CreatedAtAction(nameof(GetLead), new { id = lead.Id }, new ApiResponse<Guid>
            {
                Success = true,
                Data = lead.Id,
                Message = "Lead created successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lead");
            return StatusCode(500, new ApiResponse<Guid> { Success = false, Message = "An error occurred while creating the lead" });
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
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var userId = ClaimsHelper.GetUserId(User);

            var lead = await _context.Leads
                .Where(l => l.Id == id && l.FirmId == firmId)
                .FirstOrDefaultAsync();

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

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Lead updated successfully"
                });
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = false,
                Message = "No changes detected"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead {LeadId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "An error occurred while updating the lead"
            });
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

            return Ok(new ApiResponse<LeadStatisticsDto>
            {
                Success = true,
                Data = statistics,
                Message = "Statistics retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lead statistics");
            return StatusCode(500, new ApiResponse<LeadStatisticsDto>
            {
                Success = false,
                Message = "An error occurred while retrieving statistics"
            });
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
            return BadRequest(new ApiResponse<Guid>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

        try
        {
            var firmId = ClaimsHelper.GetFirmId(User);
            var userId = ClaimsHelper.GetUserId(User);

            var lead = await _context.Leads.Where(l => l.Id == id && l.FirmId == firmId).FirstOrDefaultAsync();
            if (lead == null)
                return NotFound(new ApiResponse<Guid> { Success = false, Message = "Lead not found" });

            if (lead.ConvertedToClientId.HasValue)
                return BadRequest(new ApiResponse<Guid> { Success = false, Message = "Lead has already been converted to a client" });

            var client = new Client
            {
                FirmId = firmId,
                Name = dto.ClientName,
                Email = dto.ClientEmail ?? lead.Email,
                Phone = dto.ClientPhone ?? lead.Phone
            };
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

            return Ok(new ApiResponse<List<LeadConversationDto>>
            {
                Success = true,
                Data = conversations,
                Message = $"Retrieved {conversations.Count} messages"
            });
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
            return BadRequest(new ApiResponse<Guid>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

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
    /// Perform automatic conflict of interest check
    /// </summary>
    private async Task PerformConflictCheck(Lead lead)
    {
        var conflictCheck = new ConflictCheck
        {
            LeadId = lead.Id,
            Status = ConflictCheckStatus.NoConflict
        };

        var existingClient = await _context.Clients
            .Where(c => c.FirmId == lead.FirmId && c.Email == lead.Email)
            .FirstOrDefaultAsync();

        if (existingClient != null)
        {
            conflictCheck.Status = ConflictCheckStatus.ConflictDetected;
            conflictCheck.ConflictType = ConflictType.DirectConflict;
            conflictCheck.ConflictDescription = "Email matches existing client";
            conflictCheck.ConflictingClientId = existingClient.Id;
        }

        _context.ConflictChecks.Add(conflictCheck);
    }

    #endregion
}
