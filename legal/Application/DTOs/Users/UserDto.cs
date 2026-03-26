using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Application.DTOs.Users;

/// <summary>
/// User data transfer object
/// </summary>
public class UserDto
{
    public Guid Id { get; set; }
    public Guid FirmId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    public string FullName => $"{FirstName} {LastName}";
}

/// <summary>
/// Update user request
/// </summary>
public class UpdateUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public UserRole? Role { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// User statistics
/// </summary>
public class UserStatsDto
{
    public Guid UserId { get; set; }
    public int CasesResponsible { get; set; }
    public int CasesAssigned { get; set; }
    public int TasksAssigned { get; set; }
    public int DocumentsUploaded { get; set; }
    public DateTime? LastActivity { get; set; }
}
