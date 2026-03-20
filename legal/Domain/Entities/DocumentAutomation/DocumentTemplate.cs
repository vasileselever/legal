using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;

/// <summary>
/// A reusable legal document template with interview fields and conditional logic.
/// Templates are owned by a firm or marked as system-wide (FirmId == null).
/// </summary>
public class DocumentTemplate : BaseEntity
{
    /// <summary>Null = system-wide template; otherwise firm-specific</summary>
    public Guid? FirmId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentCategory Category { get; set; }
    public PracticeArea PracticeArea { get; set; }

    /// <summary>Supported output languages</summary>
    public DocumentLanguage Language { get; set; } = DocumentLanguage.Romanian;

    /// <summary>
    /// The template body in a simple markup with placeholders e.g. {{party_name}}.
    /// Stored as rich text / HTML so it can be converted to DOCX/PDF.
    /// </summary>
    public string BodyTemplate { get; set; } = string.Empty;

    /// <summary>Optional English version of the body for bilingual output</summary>
    public string? BodyTemplateEn { get; set; }

    /// <summary>Version number, incremented on edits</summary>
    public int Version { get; set; } = 1;

    public bool IsActive { get; set; } = true;
    public bool IsSystemTemplate { get; set; } = false;

    /// <summary>Estimated time (minutes) to complete the interview</summary>
    public int EstimatedMinutes { get; set; }

    /// <summary>Tags for search, comma-separated</summary>
    public string? Tags { get; set; }

    // Navigation
    public Firm? Firm { get; set; }
    public ICollection<DocumentTemplateField> Fields { get; set; } = new List<DocumentTemplateField>();
    public ICollection<TemplateClauseMapping> ClauseMappings { get; set; } = new List<TemplateClauseMapping>();
    public ICollection<DocumentSession> Sessions { get; set; } = new List<DocumentSession>();
}
