using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// User entity - extends IdentityUser for authentication
/// </summary>
public class User : IdentityUser<Guid>
{
    public Guid FirmId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation properties
    public Firm Firm { get; set; } = null!;
    public ICollection<Case> ResponsibleCases { get; set; } = new List<Case>();
    public ICollection<CaseUser> CaseAssignments { get; set; } = new List<CaseUser>();
    public ICollection<Document> UploadedDocuments { get; set; } = new List<Document>();
    public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
    public ICollection<Note> Notes { get; set; } = new List<Note>();
    
    public string FullName => $"{FirstName} {LastName}";
}
