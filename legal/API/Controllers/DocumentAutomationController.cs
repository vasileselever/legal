using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.DTOs.DocumentAutomation;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// Legal Document Automation � template management, guided interview sessions,
/// document generation, clause library and quality assurance.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentAutomationController : ControllerBase
{
    private readonly IDocumentAutomationService _svc;
    private readonly ILogger<DocumentAutomationController> _logger;

    public DocumentAutomationController(IDocumentAutomationService svc, ILogger<DocumentAutomationController> logger)
    {
        _svc = svc;
        _logger = logger;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Templates
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>List document templates (firm + system-wide)</summary>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(ApiResponse<List<DocumentTemplateListDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<DocumentTemplateListDto>>>> GetTemplates(
        [FromQuery] DocumentCategory? category,
        [FromQuery] PracticeArea? practiceArea,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.GetTemplatesAsync(firmId, category, practiceArea, search, ct);
        return Ok(new ApiResponse<List<DocumentTemplateListDto>> { Success = true, Data = data });
    }

    /// <summary>Get template detail including fields and clauses</summary>
    [HttpGet("templates/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DocumentTemplateDetailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<DocumentTemplateDetailDto>>> GetTemplate(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.GetTemplateByIdAsync(firmId, id, ct);
        if (data == null)
            return NotFound(new ApiResponse<DocumentTemplateDetailDto> { Success = false, Message = "Template negasit" });
        return Ok(new ApiResponse<DocumentTemplateDetailDto> { Success = true, Data = data });
    }

    /// <summary>Create a new document template</summary>
    [HttpPost("templates")]
    [ProducesResponseType(typeof(ApiResponse<DocumentTemplateDetailDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<DocumentTemplateDetailDto>>> CreateTemplate(
        [FromBody] CreateDocumentTemplateDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.CreateTemplateAsync(firmId, dto, ct);
        return CreatedAtAction(nameof(GetTemplate), new { id = data.Id },
            new ApiResponse<DocumentTemplateDetailDto> { Success = true, Data = data, Message = "Template creat" });
    }

    /// <summary>Update an existing template</summary>
    [HttpPatch("templates/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DocumentTemplateDetailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<DocumentTemplateDetailDto>>> UpdateTemplate(
        Guid id, [FromBody] UpdateDocumentTemplateDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.UpdateTemplateAsync(firmId, id, dto, ct);
        if (data == null)
            return NotFound(new ApiResponse<DocumentTemplateDetailDto> { Success = false, Message = "Template negasit" });
        return Ok(new ApiResponse<DocumentTemplateDetailDto> { Success = true, Data = data, Message = "Template actualizat" });
    }

    /// <summary>Soft-delete a template</summary>
    [HttpDelete("templates/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTemplate(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var ok = await _svc.DeleteTemplateAsync(firmId, id, ct);
        if (!ok) return NotFound(new ApiResponse<bool> { Success = false, Message = "Template negasit" });
        return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Template sters" });
    }

    // >> Template Fields >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Add a field to a template</summary>
    [HttpPost("templates/{templateId:guid}/fields")]
    [ProducesResponseType(typeof(ApiResponse<DocumentTemplateFieldDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<DocumentTemplateFieldDto>>> AddField(
        Guid templateId, [FromBody] CreateDocumentTemplateFieldDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.AddFieldAsync(firmId, templateId, dto, ct);
        return Created("", new ApiResponse<DocumentTemplateFieldDto> { Success = true, Data = data });
    }

    /// <summary>Remove a field from a template</summary>
    [HttpDelete("templates/{templateId:guid}/fields/{fieldId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveField(Guid templateId, Guid fieldId, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var ok = await _svc.RemoveFieldAsync(firmId, templateId, fieldId, ct);
        if (!ok) return NotFound(new ApiResponse<bool> { Success = false, Message = "Camp negasit" });
        return Ok(new ApiResponse<bool> { Success = true, Data = true });
    }

    // >> Template-Clause Mappings >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Add a clause to a template</summary>
    [HttpPost("templates/{templateId:guid}/clauses")]
    [ProducesResponseType(typeof(ApiResponse<TemplateClauseMappingDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<TemplateClauseMappingDto>>> AddClauseToTemplate(
        Guid templateId, [FromBody] AddClauseToTemplateDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.AddClauseToTemplateAsync(firmId, templateId, dto, ct);
        return Created("", new ApiResponse<TemplateClauseMappingDto> { Success = true, Data = data });
    }

    /// <summary>Remove a clause mapping from a template</summary>
    [HttpDelete("templates/{templateId:guid}/clauses/{mappingId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveClauseFromTemplate(
        Guid templateId, Guid mappingId, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var ok = await _svc.RemoveClauseFromTemplateAsync(firmId, templateId, mappingId, ct);
        if (!ok) return NotFound(new ApiResponse<bool> { Success = false, Message = "Mapping negasit" });
        return Ok(new ApiResponse<bool> { Success = true, Data = true });
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Clause Library
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>List clauses in the library</summary>
    [HttpGet("clauses")]
    [ProducesResponseType(typeof(ApiResponse<List<ClauseLibraryItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<ClauseLibraryItemDto>>>> GetClauses(
        [FromQuery] DocumentCategory? category,
        [FromQuery] PracticeArea? practiceArea,
        [FromQuery] ClauseRiskLevel? riskLevel,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.GetClausesAsync(firmId, category, practiceArea, riskLevel, search, ct);
        return Ok(new ApiResponse<List<ClauseLibraryItemDto>> { Success = true, Data = data });
    }

    /// <summary>Get a single clause by ID</summary>
    [HttpGet("clauses/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ClauseLibraryItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<ClauseLibraryItemDto>>> GetClause(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.GetClauseByIdAsync(firmId, id, ct);
        if (data == null)
            return NotFound(new ApiResponse<ClauseLibraryItemDto> { Success = false, Message = "Clauza negasita" });
        return Ok(new ApiResponse<ClauseLibraryItemDto> { Success = true, Data = data });
    }

    /// <summary>Create a clause in the library</summary>
    [HttpPost("clauses")]
    [ProducesResponseType(typeof(ApiResponse<ClauseLibraryItemDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<ClauseLibraryItemDto>>> CreateClause(
        [FromBody] CreateClauseLibraryItemDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.CreateClauseAsync(firmId, dto, ct);
        return CreatedAtAction(nameof(GetClause), new { id = data.Id },
            new ApiResponse<ClauseLibraryItemDto> { Success = true, Data = data, Message = "Clauza creata" });
    }

    /// <summary>Update a clause</summary>
    [HttpPatch("clauses/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ClauseLibraryItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<ClauseLibraryItemDto>>> UpdateClause(
        Guid id, [FromBody] UpdateClauseLibraryItemDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.UpdateClauseAsync(firmId, id, dto, ct);
        if (data == null)
            return NotFound(new ApiResponse<ClauseLibraryItemDto> { Success = false, Message = "Clauza negasita" });
        return Ok(new ApiResponse<ClauseLibraryItemDto> { Success = true, Data = data, Message = "Clauza actualizata" });
    }

    /// <summary>Soft-delete a clause</summary>
    [HttpDelete("clauses/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteClause(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var ok = await _svc.DeleteClauseAsync(firmId, id, ct);
        if (!ok) return NotFound(new ApiResponse<bool> { Success = false, Message = "Clauza negasita" });
        return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Clauza stearsa" });
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Sessions (Guided Interview)
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>List interview sessions for the current user</summary>
    [HttpGet("sessions")]
    [ProducesResponseType(typeof(ApiResponse<List<DocumentSessionListDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<DocumentSessionListDto>>>> GetSessions(
        [FromQuery] DocumentSessionStatus? status, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        var data = await _svc.GetSessionsAsync(firmId, userId, status, ct);
        return Ok(new ApiResponse<List<DocumentSessionListDto>> { Success = true, Data = data });
    }

    /// <summary>Get session detail with fields and answers</summary>
    [HttpGet("sessions/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DocumentSessionDetailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<DocumentSessionDetailDto>>> GetSession(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.GetSessionByIdAsync(firmId, id, ct);
        if (data == null)
            return NotFound(new ApiResponse<DocumentSessionDetailDto> { Success = false, Message = "Sesiune negasita" });
        return Ok(new ApiResponse<DocumentSessionDetailDto> { Success = true, Data = data });
    }

    /// <summary>Start a new document generation session (interview)</summary>
    [HttpPost("sessions")]
    [ProducesResponseType(typeof(ApiResponse<DocumentSessionDetailDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<DocumentSessionDetailDto>>> StartSession(
        [FromBody] StartSessionDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        var data = await _svc.StartSessionAsync(firmId, userId, dto, ct);
        return CreatedAtAction(nameof(GetSession), new { id = data.Id },
            new ApiResponse<DocumentSessionDetailDto> { Success = true, Data = data, Message = "Sesiune pornita" });
    }

    /// <summary>Submit answers (can be called multiple times to save progress)</summary>
    [HttpPost("sessions/{id:guid}/answers")]
    [ProducesResponseType(typeof(ApiResponse<DocumentSessionDetailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<DocumentSessionDetailDto>>> SubmitAnswers(
        Guid id, [FromBody] SubmitAnswersDto dto, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.SubmitAnswersAsync(firmId, id, dto, ct);
        if (data == null)
            return NotFound(new ApiResponse<DocumentSessionDetailDto> { Success = false, Message = "Sesiune negasita" });
        return Ok(new ApiResponse<DocumentSessionDetailDto> { Success = true, Data = data, Message = "Raspunsuri salvate" });
    }

    /// <summary>Abandon an in-progress session</summary>
    [HttpPost("sessions/{id:guid}/abandon")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> AbandonSession(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var ok = await _svc.AbandonSessionAsync(firmId, id, ct);
        if (!ok) return NotFound(new ApiResponse<bool> { Success = false, Message = "Sesiune negasita" });
        return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Sesiune abandonata" });
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Document Generation
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Generate a document from a completed session</summary>
    [HttpPost("sessions/{sessionId:guid}/generate")]
    [ProducesResponseType(typeof(ApiResponse<GeneratedDocumentDetailDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<GeneratedDocumentDetailDto>>> GenerateDocument(
        Guid sessionId, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        var data = await _svc.GenerateDocumentAsync(firmId, userId, sessionId, ct);
        if (data == null)
            return NotFound(new ApiResponse<GeneratedDocumentDetailDto> { Success = false, Message = "Sesiune negasita" });
        return CreatedAtAction(nameof(GetGeneratedDocument), new { id = data.Id },
            new ApiResponse<GeneratedDocumentDetailDto> { Success = true, Data = data, Message = "Document generat" });
    }

    /// <summary>List generated documents</summary>
    [HttpGet("documents")]
    [ProducesResponseType(typeof(ApiResponse<List<GeneratedDocumentListDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<GeneratedDocumentListDto>>>> GetGeneratedDocuments(
        [FromQuery] Guid? sessionId, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.GetGeneratedDocumentsAsync(firmId, sessionId, ct);
        return Ok(new ApiResponse<List<GeneratedDocumentListDto>> { Success = true, Data = data });
    }

    /// <summary>Get a generated document by ID</summary>
    [HttpGet("documents/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<GeneratedDocumentDetailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<GeneratedDocumentDetailDto>>> GetGeneratedDocument(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.GetGeneratedDocumentByIdAsync(firmId, id, ct);
        if (data == null)
            return NotFound(new ApiResponse<GeneratedDocumentDetailDto> { Success = false, Message = "Document negasit" });
        return Ok(new ApiResponse<GeneratedDocumentDetailDto> { Success = true, Data = data });
    }

    /// <summary>Soft-delete a generated document</summary>
    [HttpDelete("documents/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteGeneratedDocument(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var ok = await _svc.DeleteGeneratedDocumentAsync(firmId, id, ct);
        if (!ok) return NotFound(new ApiResponse<bool> { Success = false, Message = "Document negasit" });
        return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Document sters" });
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Quality Assurance
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Run quality checks on a generated document</summary>
    [HttpPost("documents/{id:guid}/quality-check")]
    [ProducesResponseType(typeof(ApiResponse<QualityCheckResultDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<QualityCheckResultDto>>> RunQualityCheck(Guid id, CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.RunQualityCheckAsync(firmId, id, ct);
        return Ok(new ApiResponse<QualityCheckResultDto> { Success = true, Data = data });
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Statistics
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    /// <summary>Get document automation statistics for the firm</summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<DocumentAutomationStatsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<DocumentAutomationStatsDto>>> GetStats(CancellationToken ct)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var data = await _svc.GetStatsAsync(firmId, ct);
        return Ok(new ApiResponse<DocumentAutomationStatsDto> { Success = true, Data = data });
    }
}
