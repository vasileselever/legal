using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;

/// <summary>
/// A reusable legal clause that can be inserted into templates.
/// Clauses are risk-rated and contain legal commentary.
/// </summary>
public class ClauseLibraryItem : BaseEntity
{
    /// <summary>Null = system-wide clause; otherwise firm-specific</summary>
    public Guid? FirmId { get; set; }

    public string Title { get; set; } = string.Empty;

    /// <summary>The clause text in Romanian</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>English translation (optional)</summary>
    public string? ContentEn { get; set; }

    public DocumentCategory Category { get; set; }
    public PracticeArea PracticeArea { get; set; }

    public ClauseRiskLevel RiskLevel { get; set; } = ClauseRiskLevel.Neutral;

    /// <summary>Legal commentary explaining implications</summary>
    public string? Commentary { get; set; }

    /// <summary>Relevant jurisprudence or legal article references</summary>
    public string? LegalReferences { get; set; }

    /// <summary>Relevant Romanian law (e.g. "Art. 1350 Cod Civil")</summary>
    public string? ApplicableLaw { get; set; }

    /// <summary>Is this a mandatory clause per Romanian law?</summary>
    public bool IsMandatory { get; set; } = false;

    /// <summary>Tags for search</summary>
    public string? Tags { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public Firm? Firm { get; set; }
    public ICollection<TemplateClauseMapping> TemplateMappings { get; set; } = new List<TemplateClauseMapping>();
}
