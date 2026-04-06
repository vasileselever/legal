using System.Text.Json;
using System.Text.Json;
using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.DTOs.LegalResearch;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// AI-Powered Legal Research – search Romanian law, retrieve history and bookmarks
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LegalResearchController : ControllerBase
{
    private readonly ILegalResearchService _ai;
    private readonly ApplicationDbContext  _db;
    private readonly ILogger<LegalResearchController> _logger;

    public LegalResearchController(
        ILegalResearchService ai,
        ApplicationDbContext db,
        ILogger<LegalResearchController> logger)
    {
        _ai     = ai;
        _db     = db;
        _logger = logger;
    }

    // >> POST /api/legalresearch >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Execute an AI legal research query</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LegalResearchResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<LegalResearchResultDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<LegalResearchResultDto>>> Search(
        [FromBody] LegalResearchQueryDto dto,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<LegalResearchResultDto>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values
                    .SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);

        // Pull enriched case context when CaseId is provided
        string? caseContext = null;
        if (dto.CaseId.HasValue)
        {
            var c = await _db.Cases
                .Where(x => x.Id == dto.CaseId && x.FirmId == firmId)
                .Select(x => new { x.Title, x.CaseNumber, x.Description, x.PracticeArea })
                .FirstOrDefaultAsync(ct);
            if (c != null)
            {
                var sb = new System.Text.StringBuilder();
                sb.AppendLine($"Dosar nr. {c.CaseNumber}: {c.Title}");
                if (!string.IsNullOrWhiteSpace(c.Description))
                    sb.AppendLine($"Descriere: {c.Description[..Math.Min(400, c.Description.Length)]}");
                if (c.PracticeArea != null)
                    sb.AppendLine($"Domeniu: {c.PracticeArea}");
                caseContext = sb.ToString().Trim();
            }
        }

        var practiceHint = dto.PracticeArea.HasValue ? dto.PracticeArea.ToString() : null;

        // Map conversation history (cap at last 3 turns)
        var history = dto.History?
            .TakeLast(3)
            .Select(h => new ConversationTurn(h.Question, h.Answer))
            .ToList();

        _logger.LogInformation("Legal research query by {UserId} in firm {FirmId}: {Query}",
            userId, firmId, dto.Query[..Math.Min(80, dto.Query.Length)]);

        var result = await _ai.SearchAsync(dto.Query, practiceHint, caseContext, history, ct);
        result.PracticeArea = dto.PracticeArea;

        // Persist to history if requested
        if (dto.SaveToHistory)
        {
            var entity = new LegalResearch
            {
                FirmId          = firmId,
                UserId          = userId,
                Query           = dto.Query,
                CaseId          = dto.CaseId,
                PracticeArea    = dto.PracticeArea,
                Answer          = result.Answer,
                SourcesJson     = JsonSerializer.Serialize(result.Sources),
                ConfidenceScore = result.ConfidenceScore,
                ProcessingMs    = result.ProcessingMs,
                ModelUsed       = result.ModelUsed,
            };
            _db.LegalResearches.Add(entity);
            await _db.SaveChangesAsync(ct);
            result.Id = entity.Id;
        }

        return Ok(new ApiResponse<LegalResearchResultDto>
        {
            Success = true,
            Data    = result,
            Message = "Cercetare finalizata"
        });
    }

    // >> GET /api/legalresearch >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Get research history for the current firm</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<LegalResearchHistoryItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<LegalResearchHistoryItemDto>>>> GetHistory(
        [FromQuery] bool bookmarkedOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        pageSize   = Math.Clamp(pageSize, 1, 50);

        var q = _db.LegalResearches
            .Where(r => r.FirmId == firmId)
            .Where(r => !bookmarkedOnly || r.IsBookmarked)
            .OrderByDescending(r => r.CreatedAt);

        var rows = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id, r.Query, r.Title, r.PracticeArea,
                r.ConfidenceScore, r.SourcesJson, r.IsBookmarked, r.CreatedAt,
            })
            .ToListAsync(ct);

        var items = rows.Select(r =>
        {
            int sourceCount = 0;
            try
            {
                using var doc = JsonDocument.Parse(r.SourcesJson);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    sourceCount = doc.RootElement.GetArrayLength();
            }
            catch { /* malformed JSON - default to 0 */ }

            return new LegalResearchHistoryItemDto
            {
                Id              = r.Id,
                Query           = r.Query,
                Title           = r.Title,
                PracticeArea    = r.PracticeArea,
                ConfidenceScore = r.ConfidenceScore,
                SourceCount     = sourceCount,
                IsBookmarked    = r.IsBookmarked,
                CreatedAt       = r.CreatedAt,
            };
        }).ToList();

        return Ok(new ApiResponse<List<LegalResearchHistoryItemDto>>
        {
            Success = true,
            Data    = items,
            Message = $"{items.Count} inregistrari"
        });
    }

    // >> GET /api/legalresearch/{id} >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Get full detail of a saved research</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<LegalResearchResultDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<LegalResearchResultDto>>> GetById(
        Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var r = await _db.LegalResearches
            .FirstOrDefaultAsync(x => x.Id == id && x.FirmId == firmId, ct);

        if (r is null)
            return NotFound(new ApiResponse<LegalResearchResultDto>
                { Success = false, Message = "Nu a fost gasita" });

        List<LegalSourceDto> sources;
        try { sources = JsonSerializer.Deserialize<List<LegalSourceDto>>(r.SourcesJson) ?? new(); }
        catch { sources = new(); }

        return Ok(new ApiResponse<LegalResearchResultDto>
        {
            Success = true,
            Data = new LegalResearchResultDto
            {
                Id              = r.Id,
                Query           = r.Query,
                Answer          = r.Answer,
                Sources         = sources,
                ConfidenceScore = r.ConfidenceScore,
                ProcessingMs    = r.ProcessingMs,
                ModelUsed       = r.ModelUsed,
                PracticeArea    = r.PracticeArea,
                CreatedAt       = r.CreatedAt,
                IsBookmarked    = r.IsBookmarked,
                Title           = r.Title,
            }
        });
    }

    // >> PATCH /api/legalresearch/{id} >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Update bookmark status or title of a saved research</summary>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> Update(
        Guid id, [FromBody] UpdateLegalResearchDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var r = await _db.LegalResearches
            .FirstOrDefaultAsync(x => x.Id == id && x.FirmId == firmId, ct);
        if (r is null)
            return NotFound(new ApiResponse<bool> { Success = false, Message = "Nu a fost gasita" });

        if (dto.IsBookmarked.HasValue) r.IsBookmarked = dto.IsBookmarked.Value;
        if (dto.Title is not null)     r.Title        = dto.Title;

        await _db.SaveChangesAsync(ct);
        return Ok(new ApiResponse<bool> { Success = true, Data = true });
    }

    // >> DELETE /api/legalresearch/{id} >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Delete a saved research from history</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var r = await _db.LegalResearches
            .FirstOrDefaultAsync(x => x.Id == id && x.FirmId == firmId, ct);
        if (r is null)
            return NotFound(new ApiResponse<bool> { Success = false, Message = "Nu a fost gasita" });

        r.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok(new ApiResponse<bool> { Success = true, Data = true });
    }

    // >> GET /api/legalresearch/stats >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Aggregate statistics for the firm</summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<LegalResearchStatsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<LegalResearchStatsDto>>> GetStats(
        CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var all = await _db.LegalResearches
            .Where(r => r.FirmId == firmId)
            .Select(r => new { r.IsBookmarked, r.ConfidenceScore, r.PracticeArea })
            .ToListAsync(ct);

        var byArea = all
            .Where(r => r.PracticeArea.HasValue)
            .GroupBy(r => r.PracticeArea!.Value.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        return Ok(new ApiResponse<LegalResearchStatsDto>
        {
            Success = true,
            Data = new LegalResearchStatsDto
            {
                TotalSearches            = all.Count,
                BookmarkedSearches       = all.Count(r => r.IsBookmarked),
                AverageConfidence        = all.Count > 0 ? all.Average(r => r.ConfidenceScore) : 0,
                SearchesByPracticeArea   = byArea,
            }
        });
    }
}
