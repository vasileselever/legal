using LegalRO.CaseManagement.Domain.Common;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Note entity for case notes
/// </summary>
public class Note : BaseEntity
{
    public Guid CaseId { get; set; }
    public Guid UserId { get; set; }
    
    public string Content { get; set; } = string.Empty;
    public bool IsPinned { get; set; } = false;
    
    // Navigation properties
    public Case Case { get; set; } = null!;
    public User User { get; set; } = null!;
}
