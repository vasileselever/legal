using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Represents a saved AI legal research query and its result
/// </summary>
public class LegalResearch : BaseEntity
{
    public Guid FirmId { get; set; }
    public Guid UserId { get; set; }

    /// <summary>The natural-language question asked by the user</summary>
    public string Query { get; set; } = string.Empty;

    /// <summary>Optional case/matter context attached to the query</summary>
    public Guid? CaseId { get; set; }

    /// <summary>Practice area filter applied to the search</summary>
    public PracticeArea? PracticeArea { get; set; }

    /// <summary>Full AI-generated answer in Markdown</summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>JSON-serialised list of LegalSource citations</summary>
    public string SourcesJson { get; set; } = "[]";

    /// <summary>AI confidence score 0-100</summary>
    public int ConfidenceScore { get; set; }

    /// <summary>Processing time in milliseconds</summary>
    public int ProcessingMs { get; set; }

    /// <summary>Model / engine used (e.g. gpt-4o, mock)</summary>
    public string ModelUsed { get; set; } = string.Empty;

    /// <summary>User-assigned title for saved searches</summary>
    public string? Title { get; set; }

    /// <summary>Whether the user bookmarked this research</summary>
    public bool IsBookmarked { get; set; }

    // Navigation
    public Firm Firm { get; set; } = null!;
    public User User { get; set; } = null!;
    public Case? Case { get; set; }
}
