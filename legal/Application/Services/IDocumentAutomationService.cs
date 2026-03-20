using LegalRO.CaseManagement.Application.DTOs.DocumentAutomation;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Application.Services;

/// <summary>
/// Contract for the Document Automation service – template management,
/// guided interviews, document generation and clause library.
/// </summary>
public interface IDocumentAutomationService
{
    // >> Templates >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    Task<List<DocumentTemplateListDto>> GetTemplatesAsync(
        Guid firmId,
        DocumentCategory? category = null,
        PracticeArea? practiceArea = null,
        string? search = null,
        CancellationToken ct = default);

    Task<DocumentTemplateDetailDto?> GetTemplateByIdAsync(Guid firmId, Guid templateId, CancellationToken ct = default);

    Task<DocumentTemplateDetailDto> CreateTemplateAsync(Guid firmId, CreateDocumentTemplateDto dto, CancellationToken ct = default);

    Task<DocumentTemplateDetailDto?> UpdateTemplateAsync(Guid firmId, Guid templateId, UpdateDocumentTemplateDto dto, CancellationToken ct = default);

    Task<bool> DeleteTemplateAsync(Guid firmId, Guid templateId, CancellationToken ct = default);

    // >> Template Fields >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    Task<DocumentTemplateFieldDto> AddFieldAsync(Guid firmId, Guid templateId, CreateDocumentTemplateFieldDto dto, CancellationToken ct = default);

    Task<bool> RemoveFieldAsync(Guid firmId, Guid templateId, Guid fieldId, CancellationToken ct = default);

    // >> Clause Library >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    Task<List<ClauseLibraryItemDto>> GetClausesAsync(
        Guid firmId,
        DocumentCategory? category = null,
        PracticeArea? practiceArea = null,
        ClauseRiskLevel? riskLevel = null,
        string? search = null,
        CancellationToken ct = default);

    Task<ClauseLibraryItemDto?> GetClauseByIdAsync(Guid firmId, Guid clauseId, CancellationToken ct = default);

    Task<ClauseLibraryItemDto> CreateClauseAsync(Guid firmId, CreateClauseLibraryItemDto dto, CancellationToken ct = default);

    Task<ClauseLibraryItemDto?> UpdateClauseAsync(Guid firmId, Guid clauseId, UpdateClauseLibraryItemDto dto, CancellationToken ct = default);

    Task<bool> DeleteClauseAsync(Guid firmId, Guid clauseId, CancellationToken ct = default);

    // >> Template-Clause mapping >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    Task<TemplateClauseMappingDto> AddClauseToTemplateAsync(Guid firmId, Guid templateId, AddClauseToTemplateDto dto, CancellationToken ct = default);

    Task<bool> RemoveClauseFromTemplateAsync(Guid firmId, Guid templateId, Guid mappingId, CancellationToken ct = default);

    // >> Sessions (Interview) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    Task<List<DocumentSessionListDto>> GetSessionsAsync(Guid firmId, Guid userId, DocumentSessionStatus? status = null, CancellationToken ct = default);

    Task<DocumentSessionDetailDto?> GetSessionByIdAsync(Guid firmId, Guid sessionId, CancellationToken ct = default);

    Task<DocumentSessionDetailDto> StartSessionAsync(Guid firmId, Guid userId, StartSessionDto dto, CancellationToken ct = default);

    Task<DocumentSessionDetailDto?> SubmitAnswersAsync(Guid firmId, Guid sessionId, SubmitAnswersDto dto, CancellationToken ct = default);

    Task<bool> AbandonSessionAsync(Guid firmId, Guid sessionId, CancellationToken ct = default);

    // >> Document Generation >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    Task<GeneratedDocumentDetailDto?> GenerateDocumentAsync(Guid firmId, Guid userId, Guid sessionId, CancellationToken ct = default);

    Task<List<GeneratedDocumentListDto>> GetGeneratedDocumentsAsync(Guid firmId, Guid? sessionId = null, CancellationToken ct = default);

    Task<GeneratedDocumentDetailDto?> GetGeneratedDocumentByIdAsync(Guid firmId, Guid documentId, CancellationToken ct = default);

    Task<bool> DeleteGeneratedDocumentAsync(Guid firmId, Guid documentId, CancellationToken ct = default);

    // >> Quality Assurance >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    Task<QualityCheckResultDto> RunQualityCheckAsync(Guid firmId, Guid generatedDocumentId, CancellationToken ct = default);

    // >> Statistics >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    Task<DocumentAutomationStatsDto> GetStatsAsync(Guid firmId, CancellationToken ct = default);
}
