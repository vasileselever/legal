using LegalRO.CaseManagement.Domain.Common;

namespace LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;

/// <summary>
/// An answer provided by the user during a document generation interview.
/// </summary>
public class DocumentSessionAnswer : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid FieldId { get; set; }

    /// <summary>The user's answer serialised as a string</summary>
    public string Value { get; set; } = string.Empty;

    // Navigation
    public DocumentSession Session { get; set; } = null!;
    public DocumentTemplateField Field { get; set; } = null!;
}
