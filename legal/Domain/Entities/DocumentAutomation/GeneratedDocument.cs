using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;

/// <summary>
/// A document that has been generated from a completed session.
/// Stores the final rendered content and export metadata.
/// </summary>
public class GeneratedDocument : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid FirmId { get; set; }
    public Guid GeneratedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    /// <summary>Final rendered HTML content</summary>
    public string ContentHtml { get; set; } = string.Empty;

    /// <summary>Optional English version</summary>
    public string? ContentHtmlEn { get; set; }

    public DocumentLanguage Language { get; set; }
    public DocumentCategory Category { get; set; }

    /// <summary>Path to exported file (Word/PDF) in blob storage</summary>
    public string? ExportedFilePath { get; set; }

    /// <summary>MIME type of exported file</summary>
    public string? ExportedMimeType { get; set; }

    /// <summary>Version number (re-generation increments this)</summary>
    public int Version { get; set; } = 1;

    /// <summary>
    /// JSON snapshot of all field values used during generation
    /// for reproducibility / audit
    /// </summary>
    public string FieldValuesJson { get; set; } = "{}";

    /// <summary>Quality assurance results in JSON (consistency checks, etc.)</summary>
    public string? QualityCheckResultsJson { get; set; }

    /// <summary>Readability score (0-100)</summary>
    public int? ReadabilityScore { get; set; }

    // Navigation
    public DocumentSession Session { get; set; } = null!;
    public Firm Firm { get; set; } = null!;
    public User GeneratedByUser { get; set; } = null!;
}
