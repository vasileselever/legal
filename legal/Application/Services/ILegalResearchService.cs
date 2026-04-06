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
        IReadOnlyList<ConversationTurn>? history = null,
        CancellationToken ct = default);
}

/// <summary>A single previous Q&amp;A turn passed as conversation context</summary>
public record ConversationTurn(string Question, string Answer);
