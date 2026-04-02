using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Cases;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Enums;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskStatusEnum = LegalRO.CaseManagement.Domain.Enums.TaskStatus;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CasesController> _logger;

    public CasesController(ApplicationDbContext context, ILogger<CasesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all cases for the user's firm with filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<CaseListItem>>> GetCases(
        [FromQuery] CaseStatus? status,
        [FromQuery] PracticeArea? practiceArea,
        [FromQuery] Guid? responsibleLawyerId,
        [FromQuery] Guid? clientId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortOrder = "desc")
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var query = _context.Cases
            .Where(c => c.FirmId == firmId)
            .Include(c => c.Client)
            .Include(c => c.ResponsibleLawyer)
            .AsQueryable();

        // Apply filters
        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        if (practiceArea.HasValue)
            query = query.Where(c => c.PracticeArea == practiceArea.Value);

        if (responsibleLawyerId.HasValue)
            query = query.Where(c => c.ResponsibleLawyerId == responsibleLawyerId.Value);

        if (clientId.HasValue)
            query = query.Where(c => c.ClientId == clientId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(search) ||
                c.CaseNumber.ToLower().Contains(search) ||
                c.Client.Name.ToLower().Contains(search));
        }

        // Apply sorting
        query = sortBy.ToLower() switch
        {
            "title" => sortOrder.ToLower() == "asc" ? query.OrderBy(c => c.Title) : query.OrderByDescending(c => c.Title),
            "casenumber" => sortOrder.ToLower() == "asc" ? query.OrderBy(c => c.CaseNumber) : query.OrderByDescending(c => c.CaseNumber),
            "client" => sortOrder.ToLower() == "asc" ? query.OrderBy(c => c.Client.Name) : query.OrderByDescending(c => c.Client.Name),
            "openingdate" => sortOrder.ToLower() == "asc" ? query.OrderBy(c => c.OpeningDate) : query.OrderByDescending(c => c.OpeningDate),
            _ => sortOrder.ToLower() == "asc" ? query.OrderBy(c => c.CreatedAt) : query.OrderByDescending(c => c.CreatedAt)
        };

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply pagination
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CaseListItem
            {
                Id = c.Id,
                CaseNumber = c.CaseNumber,
                Title = c.Title,
                Status = c.Status,
                PracticeArea = c.PracticeArea,
                ClientId = c.ClientId,
                ClientName = c.Client.Name,
                ResponsibleLawyerName = c.ResponsibleLawyer.FullName,
                OpeningDate = c.OpeningDate,
                NextDeadline = c.Deadlines
                    .Where(d => !d.IsCompleted && d.DueDate >= DateTime.UtcNow)
                    .OrderBy(d => d.DueDate)
                    .Select(d => (DateTime?)d.DueDate)
                    .FirstOrDefault(),
                LastActivity = c.Activities
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => (DateTime?)a.CreatedAt)
                    .FirstOrDefault()
            })
            .ToListAsync();

        var response = new PagedResponse<CaseListItem>
        {
            Data = items,
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

    /// <summary>
    /// Get a single case by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CaseResponse>> GetCase(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var caseEntity = await _context.Cases
            .Where(c => c.Id == id && c.FirmId == firmId)
            .Include(c => c.Client)
            .Include(c => c.ResponsibleLawyer)
            .Include(c => c.AssignedUsers)
                .ThenInclude(cu => cu.User)
            .Include(c => c.Documents)
            .Include(c => c.Tasks)
            .Include(c => c.Deadlines)
            .FirstOrDefaultAsync();

        if (caseEntity == null)
            return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Case not found" });

        var response = new CaseResponse
        {
            Id = caseEntity.Id,
            CaseNumber = caseEntity.CaseNumber,
            Title = caseEntity.Title,
            Description = caseEntity.Description,
            Status = caseEntity.Status,
            PracticeArea = caseEntity.PracticeArea,
            CaseType = caseEntity.CaseType,
            CaseValue = caseEntity.CaseValue,
            Court = caseEntity.Court,
            OpposingParty = caseEntity.OpposingParty,
            BillingArrangement = caseEntity.BillingArrangement,
            OpeningDate = caseEntity.OpeningDate,
            ClosingDate = caseEntity.ClosingDate,
            Client = new ClientSummaryDto
            {
                Id = caseEntity.Client.Id,
                Name = caseEntity.Client.Name,
                Email = caseEntity.Client.Email,
                Phone = caseEntity.Client.Phone
            },
            ResponsibleLawyer = new UserSummaryDto
            {
                Id = caseEntity.ResponsibleLawyer.Id,
                FirstName = caseEntity.ResponsibleLawyer.FirstName,
                LastName = caseEntity.ResponsibleLawyer.LastName,
                FullName = caseEntity.ResponsibleLawyer.FullName,
                Email = caseEntity.ResponsibleLawyer.Email,
                Role = caseEntity.ResponsibleLawyer.Role
            },
            AssignedUsers = caseEntity.AssignedUsers.Select(cu => new UserSummaryDto
            {
                Id = cu.User.Id,
                FirstName = cu.User.FirstName,
                LastName = cu.User.LastName,
                FullName = cu.User.FullName,
                Email = cu.User.Email,
                Role = cu.User.Role
            }).ToList(),
            DocumentCount = caseEntity.Documents.Count,
            OpenTaskCount = caseEntity.Tasks.Count(t => t.Status != TaskStatusEnum.Completed),
            NextDeadline = caseEntity.Deadlines
                .Where(d => !d.IsCompleted && d.DueDate >= DateTime.UtcNow)
                .OrderBy(d => d.DueDate)
                .Select(d => (DateTime?)d.DueDate)
                .FirstOrDefault(),
            CreatedAt = caseEntity.CreatedAt,
            UpdatedAt = caseEntity.UpdatedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Create a new case
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CaseResponse>> CreateCase([FromBody] CreateCaseRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);

        // Verify client belongs to firm
        var clientExists = await _context.Clients
            .AnyAsync(c => c.Id == request.ClientId && c.FirmId == firmId);

        if (!clientExists)
            return BadRequest(new ApiError { Code = "INVALID_CLIENT", Message = "Client not found or doesn't belong to your firm" });

        // Verify responsible lawyer belongs to firm
        var lawyerExists = await _context.Users
            .AnyAsync(u => u.Id == request.ResponsibleLawyerId && u.FirmId == firmId);

        if (!lawyerExists)
            return BadRequest(new ApiError { Code = "INVALID_LAWYER", Message = "Lawyer not found or doesn't belong to your firm" });

        // Generate case number (simple implementation - can be customized)
        var year = DateTime.UtcNow.Year;
        var caseCount = await _context.Cases.Where(c => c.FirmId == firmId).CountAsync();
        var caseNumber = $"{year}-{(caseCount + 1):D5}";

        var newCase = new Case
        {
            FirmId = firmId,
            CaseNumber = caseNumber,
            Title = request.Title,
            Description = request.Description,
            ClientId = request.ClientId,
            ResponsibleLawyerId = request.ResponsibleLawyerId,
            PracticeArea = request.PracticeArea,
            CaseType = request.CaseType,
            Court = request.Court,
            OpposingParty = request.OpposingParty,
            CaseValue = request.CaseValue,
            BillingArrangement = request.BillingArrangement,
            OpeningDate = DateTime.UtcNow,
            Status = CaseStatus.Active,
            CreatedBy = userId.ToString()
        };

        _context.Cases.Add(newCase);

        // Create activity log
        var activity = new Activity
        {
            CaseId = newCase.Id,
            UserId = userId,
            ActivityType = "CaseCreated",
            Description = $"Case created: {newCase.Title}"
        };
        _context.Activities.Add(activity);

        await _context.SaveChangesAsync();

        _logger.LogInformation("Case {CaseNumber} created by user {UserId}", newCase.CaseNumber, userId);

        // Fetch the complete case to return
        return await GetCase(newCase.Id);
    }

    /// <summary>
    /// Update an existing case
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<CaseResponse>> UpdateCase(Guid id, [FromBody] UpdateCaseRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);

        var caseEntity = await _context.Cases
            .Where(c => c.Id == id && c.FirmId == firmId)
            .FirstOrDefaultAsync();

        if (caseEntity == null)
            return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Case not found" });

        // Verify responsible lawyer belongs to firm
        var lawyerExists = await _context.Users
            .AnyAsync(u => u.Id == request.ResponsibleLawyerId && u.FirmId == firmId);

        if (!lawyerExists)
            return BadRequest(new ApiError { Code = "INVALID_LAWYER", Message = "Lawyer not found or doesn't belong to your firm" });

        caseEntity.Title = request.Title;
        caseEntity.Description = request.Description;
        caseEntity.PracticeArea = request.PracticeArea;
        caseEntity.CaseType = request.CaseType;
        caseEntity.Status = request.Status;
        caseEntity.ResponsibleLawyerId = request.ResponsibleLawyerId;
        caseEntity.Court = request.Court;
        caseEntity.OpposingParty = request.OpposingParty;
        caseEntity.CaseValue = request.CaseValue;
        caseEntity.BillingArrangement = request.BillingArrangement;
        caseEntity.UpdatedBy = userId.ToString();

        if (request.Status == CaseStatus.Closed && !caseEntity.ClosingDate.HasValue)
        {
            caseEntity.ClosingDate = DateTime.UtcNow;
        }

        // Create activity log
        var activity = new Activity
        {
            CaseId = caseEntity.Id,
            UserId = userId,
            ActivityType = "CaseUpdated",
            Description = $"Case updated: {caseEntity.Title}"
        };
        _context.Activities.Add(activity);

        await _context.SaveChangesAsync();

        _logger.LogInformation("Case {CaseNumber} updated by user {UserId}", caseEntity.CaseNumber, userId);

        return await GetCase(id);
    }

    /// <summary>
    /// Delete a case (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCase(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);

        var caseEntity = await _context.Cases
            .Where(c => c.Id == id && c.FirmId == firmId)
            .FirstOrDefaultAsync();

        if (caseEntity == null)
            return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Case not found" });

        caseEntity.IsDeleted = true;
        caseEntity.UpdatedBy = userId.ToString();

        await _context.SaveChangesAsync();

        _logger.LogInformation("Case {CaseNumber} deleted by user {UserId}", caseEntity.CaseNumber, userId);

        return NoContent();
    }
}
