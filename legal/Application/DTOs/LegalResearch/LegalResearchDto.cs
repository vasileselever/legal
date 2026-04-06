using LegalRO.CaseManagement.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace LegalRO.CaseManagement.Application.DTOs.LegalResearch;

// ?? Request DTOs ??????????????????????????????????????????????????????????????

/// <summary>Payload to execute an AI legal research query</summary>
public class LegalResearchQueryDto
{
    [Required(ErrorMessage = "Intrebarea este obligatorie")]
    [MinLength(10, ErrorMessage = "Intrebarea trebuie sa aiba cel putin 10 caractere")]
    [MaxLength(2000, ErrorMessage = "Intrebarea nu poate depasi 2000 caractere")]
    public string Query { get; set; } = string.Empty;

    public PracticeArea? PracticeArea { get; set; }

    /// <summary>Optional case ID to include as context</summary>
    public Guid? CaseId { get; set; }

    /// <summary>Whether to save this search to history (default true)</summary>
    public bool SaveToHistory { get; set; } = true;

    /// <summary>Previous Q&amp;A turns for conversational context (max 3)</summary>
    public List<ConversationTurnDto>? History { get; set; }
}

/// <summary>A single prior Q&amp;A exchange passed for conversational context</summary>
public class ConversationTurnDto
{
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
}

/// <summary>Update bookmark / title of a saved research</summary>
public class UpdateLegalResearchDto
{
    [MaxLength(200)]
    public string? Title { get; set; }
    public bool? IsBookmarked { get; set; }
}

// ?? Response DTOs ?????????????????????????????????????????????????????????????

/// <summary>A single legal source / citation returned by the AI</summary>
public class LegalSourceDto
{
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;   // Lege | Hotarare | Jurisprudenta | Doctrina
    public string? Reference { get; set; }              // e.g. "Art. 1357 Cod Civil"
    public string? Url { get; set; }
    public string? Excerpt { get; set; }
    public string? PublishedDate { get; set; }
    public int Relevance { get; set; }                 // 0-100
}

/// <summary>Full result of an AI legal research query</summary>
public class LegalResearchResultDto
{
    public Guid Id { get; set; }
    public string Query { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public List<LegalSourceDto> Sources { get; set; } = new();
    public int ConfidenceScore { get; set; }
    public int ProcessingMs { get; set; }
    public string ModelUsed { get; set; } = string.Empty;
    public PracticeArea? PracticeArea { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsBookmarked { get; set; }
    public string? Title { get; set; }
    /// <summary>Follow-up questions suggested by the AI</summary>
    public List<string> RelatedQuestions { get; set; } = new();
}

/// <summary>Summary item for the research history list</summary>
public class LegalResearchHistoryItemDto
{
    public Guid Id { get; set; }
    public string Query { get; set; } = string.Empty;
    public string? Title { get; set; }
    public PracticeArea? PracticeArea { get; set; }
    public int ConfidenceScore { get; set; }
    public int SourceCount { get; set; }
    public bool IsBookmarked { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Statistics for the legal research dashboard card</summary>
public class LegalResearchStatsDto
{
    public int TotalSearches { get; set; }
    public int BookmarkedSearches { get; set; }
    public double AverageConfidence { get; set; }
    public Dictionary<string, int> SearchesByPracticeArea { get; set; } = new();
}
