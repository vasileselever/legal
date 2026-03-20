using LegalRO.CaseManagement.Application.DTOs.LegalResearch;

namespace LegalRO.CaseManagement.Application.Services;

/// <summary>
/// Contract for the AI Legal Research service
/// </summary>
public interface ILegalResearchService
{
    Task<LegalResearchResultDto> SearchAsync(
        string query,
        string? practiceAreaHint,
        string? caseContext,
        CancellationToken ct = default);
}
