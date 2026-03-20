using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Deadline entity for tracking case deadlines
/// </summary>
public class Deadline : BaseEntity
{
    public Guid CaseId { get; set; }
    public Guid AssignedTo { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public DateTime DueDate { get; set; }
    public TimeSpan? DueTime { get; set; }
    
    public DeadlineType DeadlineType { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    
    /// <summary>
    /// For recurring deadlines
    /// </summary>
    public bool IsRecurring { get; set; } = false;
    public string? RecurrencePattern { get; set; }
    
    /// <summary>
    /// Reminder days before deadline (e.g., "1,3,7")
    /// </summary>
    public string? ReminderDays { get; set; }
    
    /// <summary>
    /// For NCPC deadline calculations - source event date
    /// </summary>
    public DateTime? SourceEventDate { get; set; }
    
    /// <summary>
    /// Romanian NCPC deadline type code (e.g., "NCPC-Art123")
    /// </summary>
    public string? NCPCRuleCode { get; set; }
    
    // Navigation properties
    public Case Case { get; set; } = null!;
    public User AssignedUser { get; set; } = null!;
}
