using LegalRO.CaseManagement.Domain.Common;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Activity entity for audit trail and case timeline
/// </summary>
public class Activity : BaseEntity
{
    public Guid CaseId { get; set; }
    public Guid UserId { get; set; }
    
    /// <summary>
    /// Activity type (CaseCreated, DocumentUploaded, TaskCompleted, etc.)
    /// </summary>
    public string ActivityType { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// JSON field for additional activity metadata
    /// </summary>
    public string? MetadataJson { get; set; }
    
    // Navigation properties
    public Case Case { get; set; } = null!;
    public User User { get; set; } = null!;
}
