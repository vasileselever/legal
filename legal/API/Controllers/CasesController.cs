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
    private readonly IWebHostEnvironment _env;

    private string UploadsRoot => Path.Combine(_env.ContentRootPath, "uploads");

    public CasesController(ApplicationDbContext context, ILogger<CasesController> logger, IWebHostEnvironment env)
    {
        _context = context;
        _logger = logger;
        _env = env;
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
            .FirstOrDefaultAsync();

        if (caseEntity == null)
            return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Case not found" });

        var documentCount = await _context.Documents
            .CountAsync(d => d.CaseId == id && !d.IsDeleted);

        var openTaskCount = await _context.Tasks
            .CountAsync(t => t.CaseId == id && !t.IsDeleted && t.Status != TaskStatusEnum.Completed);

        var nextDeadline = await _context.Deadlines
            .Where(d => d.CaseId == id && !d.IsDeleted && !d.IsCompleted && d.DueDate >= DateTime.UtcNow)
            .OrderBy(d => d.DueDate)
            .Select(d => (DateTime?)d.DueDate)
            .FirstOrDefaultAsync();

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
            DocumentCount = documentCount,
            OpenTaskCount = openTaskCount,
            NextDeadline = nextDeadline,
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

        // Copy any documents attached to leads that were converted into this client
        // so the new dosar starts with the intake documents already attached.
        await CopyLeadDocumentsToCaseAsync(newCase, userId, request.LeadId);

        _logger.LogInformation("Case {CaseNumber} created by user {UserId}", newCase.CaseNumber, userId);

        // Fetch the complete case to return
        return await GetCase(newCase.Id);
    }

    /// <summary>
    /// Copy every LeadDocument belonging to leads related to the new case's client into the Documents table.
    /// Matching priority:
    ///   1. Explicit <paramref name="leadId"/> passed from the UI (most reliable).
    ///   2. Any lead whose <c>ConvertedToClientId</c> points to the case's client.
    ///   3. As a last resort, any lead sharing the client's email or phone.
    /// Files are physically copied into <c>uploads/cases/{caseId}</c>.
    /// </summary>
    private async Task CopyLeadDocumentsToCaseAsync(Case newCase, Guid userId, Guid? leadId)
    {
        // Resolve the set of candidate leadIds.
        var leadIds = new HashSet<Guid>();

        if (leadId.HasValue)
        {
            var explicitExists = await _context.Leads
                .AnyAsync(l => l.Id == leadId.Value && l.FirmId == newCase.FirmId);
            if (explicitExists) leadIds.Add(leadId.Value);
        }

        var convertedLeadIds = await _context.Leads
            .Where(l => l.FirmId == newCase.FirmId && l.ConvertedToClientId == newCase.ClientId)
            .Select(l => l.Id)
            .ToListAsync();
        foreach (var id in convertedLeadIds) leadIds.Add(id);

        if (leadIds.Count == 0)
        {
            // Fallback: match by email / phone on the client.
            var client = await _context.Clients
                .Where(c => c.Id == newCase.ClientId && c.FirmId == newCase.FirmId)
                .Select(c => new { c.Email, c.Phone })
                .FirstOrDefaultAsync();

            if (client != null)
            {
                var matched = await _context.Leads
                    .Where(l => l.FirmId == newCase.FirmId
                             && ((client.Email != null && l.Email == client.Email)
                              || (client.Phone != null && l.Phone == client.Phone)))
                    .Select(l => l.Id)
                    .ToListAsync();
                foreach (var id in matched) leadIds.Add(id);
            }
        }

        if (leadIds.Count == 0) return;

        var leadDocs = await _context.LeadDocuments
            .Where(ld => leadIds.Contains(ld.LeadId))
            .ToListAsync();

        if (leadDocs.Count == 0) return;

        var caseUploadsDir = Path.Combine(UploadsRoot, "cases", newCase.Id.ToString());
        Directory.CreateDirectory(caseUploadsDir);

        foreach (var ld in leadDocs)
        {
            string copiedPath = ld.FilePath;
            try
            {
                if (System.IO.File.Exists(ld.FilePath))
                {
                    var destName = $"{Guid.NewGuid()}_{Path.GetFileName(ld.FilePath)}";
                    copiedPath = Path.Combine(caseUploadsDir, destName);
                    System.IO.File.Copy(ld.FilePath, copiedPath, overwrite: false);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not copy lead document file {Path} to case {CaseId}", ld.FilePath, newCase.Id);
            }

            _context.Documents.Add(new Document
            {
                CaseId = newCase.Id,
                UploadedBy = userId,
                FileName = ld.FileName,
                FilePath = copiedPath,
                FileSize = ld.FileSize,
                MimeType = ld.FileType,
                Title = ld.FileName,
                Description = ld.Description ?? "Document preluat de la lead",
                Category = "FromLead",
                GeneratedDocumentId = ld.GeneratedDocumentId,
            });
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation(
            "Copied {Count} lead document(s) from {LeadCount} lead(s) to case {CaseId}",
            leadDocs.Count, leadIds.Count, newCase.Id);
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
    /// Update only the status of a case
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> PatchCaseStatus(Guid id, [FromBody] PatchCaseStatusRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);

        var caseEntity = await _context.Cases
            .Where(c => c.Id == id && c.FirmId == firmId)
            .FirstOrDefaultAsync();

        if (caseEntity == null)
            return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Case not found" });

        var oldStatus = caseEntity.Status;
        caseEntity.Status = request.Status;
        caseEntity.UpdatedBy = userId.ToString();

        if (request.Status == CaseStatus.Closed && !caseEntity.ClosingDate.HasValue)
            caseEntity.ClosingDate = DateTime.UtcNow;

        _context.Activities.Add(new Activity
        {
            CaseId = caseEntity.Id,
            UserId = userId,
            ActivityType = "StatusChanged",
            Description = $"Status changed from {oldStatus} to {request.Status}"
        });

        await _context.SaveChangesAsync();
        _logger.LogInformation("Case {CaseId} status changed from {Old} to {New} by {UserId}", id, oldStatus, request.Status, userId);

        return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Status updated" });
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

    /// <summary>
    /// Save a generated document (from Document Automation) as an attachment on a case.
    /// </summary>
    [HttpPost("{id}/documents/from-generated/{generatedDocId}")]
    public async Task<ActionResult<ApiResponse<CaseDocumentDto>>> AttachGeneratedDocument(
        Guid id, Guid generatedDocId)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);

        var caseEntity = await _context.Cases
            .FirstOrDefaultAsync(c => c.Id == id && c.FirmId == firmId);
        if (caseEntity == null)
            return NotFound(new ApiResponse<CaseDocumentDto> { Success = false, Message = "Dosar negasit" });

        var generated = await _context.GeneratedDocuments
            .FirstOrDefaultAsync(d => d.Id == generatedDocId && d.FirmId == firmId);
        if (generated == null)
            return NotFound(new ApiResponse<CaseDocumentDto> { Success = false, Message = "Document generat negasit" });

        var uploadsDir = Path.Combine(UploadsRoot, "cases", id.ToString());
        Directory.CreateDirectory(uploadsDir);

        var safeTitle = string.Concat(generated.Title.Split(Path.GetInvalidFileNameChars()));
        var uniqueName = $"{Guid.NewGuid()}_{safeTitle}.html";
        var filePath = Path.Combine(uploadsDir, uniqueName);
        await System.IO.File.WriteAllTextAsync(filePath, generated.ContentHtml);

        var doc = new Document
        {
            CaseId = id,
            UploadedBy = userId,
            FileName = uniqueName,
            FilePath = filePath,
            FileSize = System.Text.Encoding.UTF8.GetByteCount(generated.ContentHtml),
            MimeType = "text/html",
            Title = generated.Title,
            Description = $"Document generat automat: {generated.Title}",
            GeneratedDocumentId = generatedDocId,
            Category = "Generated",
        };

        _context.Documents.Add(doc);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Generated document {GeneratedDocId} attached to case {CaseId} as {FileName}",
            generatedDocId, id, uniqueName);

        return Ok(new ApiResponse<CaseDocumentDto>
        {
            Success = true,
            Data = new CaseDocumentDto
            {
                Id = doc.Id,
                FileName = doc.FileName,
                Title = doc.Title,
                Description = doc.Description,
                FileSize = doc.FileSize,
                MimeType = doc.MimeType,
                GeneratedDocumentId = doc.GeneratedDocumentId,
                CreatedAt = doc.CreatedAt,
            },
            Message = "Document ata?at cu succes la dosar"
        });
    }
}
