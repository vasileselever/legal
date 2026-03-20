using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;
using TaskStatusEnum = LegalRO.CaseManagement.Domain.Enums.TaskStatus;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Task entity for case tasks
/// </summary>
public class TaskItem : BaseEntity
{
    public Guid CaseId { get; set; }
    public Guid AssignedTo { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public Priority Priority { get; set; } = Priority.Medium;
    public TaskStatusEnum Status { get; set; } = TaskStatusEnum.NotStarted;
    
    public DateTime? DueDate { get; set; }
    public TimeSpan? DueTime { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    /// <summary>
    /// Task type (Research, Drafting, Review, Filing, etc.)
    /// </summary>
    public string? TaskType { get; set; }
    
    /// <summary>
    /// Time tracked in minutes (for billing)
    /// </summary>
    public int? TimeTrackedMinutes { get; set; }
    
    // Navigation properties
    public Case Case { get; set; } = null!;
    public User AssignedUser { get; set; } = null!;
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}

/// <summary>
/// Comments on tasks
/// </summary>
public class TaskComment : BaseEntity
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    
    public TaskItem Task { get; set; } = null!;
    public User User { get; set; } = null!;
}
