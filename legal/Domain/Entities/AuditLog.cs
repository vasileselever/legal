using LegalRO.CaseManagement.Domain.Common;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Audit log for security and compliance
/// </summary>
public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    
    /// <summary>
    /// JSON field storing the changes made
    /// </summary>
    public string? ChangesJson { get; set; }
    
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
