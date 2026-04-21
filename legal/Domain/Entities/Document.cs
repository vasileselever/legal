using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Document entity for case documents
/// </summary>
public class Document : BaseEntity
{
    public Guid CaseId { get; set; }
    public Guid UploadedBy { get; set; }
    
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? MimeType { get; set; }
    
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Tags { get; set; }
    
    /// <summary>
    /// Actual date of the document (different from upload date)
    /// </summary>
    public DateTime? DocumentDate { get; set; }
    
    public ConfidentialityLevel ConfidentialityLevel { get; set; } = ConfidentialityLevel.Internal;
    
    /// <summary>
    /// Version tracking
    /// </summary>
    public int Version { get; set; } = 1;
    public Guid? ParentDocumentId { get; set; }

    /// <summary>
    /// Set when this document was produced by Document Automation.
    /// Used to show the "Atasat la Dosar" indicator in the Documents list.
    /// </summary>
    public Guid? GeneratedDocumentId { get; set; }
    
    // Navigation properties
    public Case Case { get; set; } = null!;
    public User Uploader { get; set; } = null!;
    public Document? ParentDocument { get; set; }
    public ICollection<Document> ChildVersions { get; set; } = new List<Document>();
}
