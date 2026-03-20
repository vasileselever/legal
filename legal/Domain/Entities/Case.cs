using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Case entity representing a legal case/matter
/// </summary>
public class Case : BaseEntity
{
    public Guid FirmId { get; set; }
    
    /// <summary>
    /// Unique case number (alphanumeric, unique per firm)
    /// </summary>
    public string CaseNumber { get; set; } = string.Empty;
    
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public Guid ClientId { get; set; }
    public Guid ResponsibleLawyerId { get; set; }
    
    public PracticeArea PracticeArea { get; set; }
    public CaseType CaseType { get; set; }
    public CaseStatus Status { get; set; } = CaseStatus.Active;
    
    /// <summary>
    /// Romanian court or jurisdiction
    /// </summary>
    public string? Court { get; set; }
    
    /// <summary>
    /// Opposing party in litigation
    /// </summary>
    public string? OpposingParty { get; set; }
    
    /// <summary>
    /// Case value in RON
    /// </summary>
    public decimal? CaseValue { get; set; }
    
    public BillingArrangement? BillingArrangement { get; set; }
    
    public DateTime OpeningDate { get; set; } = DateTime.UtcNow;
    public DateTime? ClosingDate { get; set; }
    public DateTime? StatuteOfLimitations { get; set; }
    
    /// <summary>
    /// JSON field for custom fields configured by firm
    /// </summary>
    public string? CustomFieldsJson { get; set; }
    
    // Navigation properties
    public Firm Firm { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public User ResponsibleLawyer { get; set; } = null!;
    public ICollection<CaseUser> AssignedUsers { get; set; } = new List<CaseUser>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<Deadline> Deadlines { get; set; } = new List<Deadline>();
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<Note> Notes { get; set; } = new List<Note>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}

/// <summary>
/// Many-to-many relationship between Cases and Users (assigned team members)
/// </summary>
public class CaseUser
{
    public Guid CaseId { get; set; }
    public Guid UserId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    
    public Case Case { get; set; } = null!;
    public User User { get; set; } = null!;
}
