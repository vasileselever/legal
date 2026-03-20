using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;

/// <summary>
/// Represents a user's interview session for generating a document from a template.
/// Users can save progress and return later.
/// </summary>
public class DocumentSession : BaseEntity
{
    public Guid FirmId { get; set; }
    public Guid UserId { get; set; }
    public Guid TemplateId { get; set; }

    /// <summary>Optional case to associate the generated document with</summary>
    public Guid? CaseId { get; set; }

    /// <summary>Optional client association</summary>
    public Guid? ClientId { get; set; }

    public DocumentSessionStatus Status { get; set; } = DocumentSessionStatus.InProgress;
    public DocumentLanguage Language { get; set; } = DocumentLanguage.Romanian;

    /// <summary>Index of the last answered field (for resume)</summary>
    public int CurrentFieldIndex { get; set; } = 0;

    /// <summary>Percentage of completion (0-100)</summary>
    public int ProgressPercent { get; set; } = 0;

    public DateTime? CompletedAt { get; set; }

    /// <summary>Custom title for this session/document</summary>
    public string? Title { get; set; }

    /// <summary>Optional notes from the user</summary>
    public string? Notes { get; set; }

    // Navigation
    public Firm Firm { get; set; } = null!;
    public User User { get; set; } = null!;
    public DocumentTemplate Template { get; set; } = null!;
    public Case? Case { get; set; }
    public Client? Client { get; set; }
    public ICollection<DocumentSessionAnswer> Answers { get; set; } = new List<DocumentSessionAnswer>();
    public ICollection<GeneratedDocument> GeneratedDocuments { get; set; } = new List<GeneratedDocument>();
}
