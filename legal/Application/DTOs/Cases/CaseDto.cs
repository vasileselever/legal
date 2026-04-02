using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Application.DTOs.Cases;

/// <summary>
/// DTO for case creation request
/// </summary>
public class CreateCaseRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid ClientId { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public CaseType CaseType { get; set; }
    public Guid ResponsibleLawyerId { get; set; }
    public string? Court { get; set; }
    public string? OpposingParty { get; set; }
    public decimal? CaseValue { get; set; }
    public BillingArrangement? BillingArrangement { get; set; }
}

/// <summary>
/// DTO for case update request
/// </summary>
public class UpdateCaseRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public CaseType CaseType { get; set; }
    public CaseStatus Status { get; set; }
    public Guid ResponsibleLawyerId { get; set; }
    public string? Court { get; set; }
    public string? OpposingParty { get; set; }
    public decimal? CaseValue { get; set; }
    public BillingArrangement? BillingArrangement { get; set; }
}

/// <summary>
/// DTO for case response
/// </summary>
public class CaseResponse
{
    public Guid Id { get; set; }
    public string CaseNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CaseStatus Status { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public CaseType CaseType { get; set; }
    public decimal? CaseValue { get; set; }
    public string? Court { get; set; }
    public string? OpposingParty { get; set; }
    public BillingArrangement? BillingArrangement { get; set; }
    public DateTime OpeningDate { get; set; }
    public DateTime? ClosingDate { get; set; }
    public ClientSummaryDto Client { get; set; } = null!;
    public UserSummaryDto ResponsibleLawyer { get; set; } = null!;
    public List<UserSummaryDto> AssignedUsers { get; set; } = new();
    public int DocumentCount { get; set; }
    public int OpenTaskCount { get; set; }
    public DateTime? NextDeadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for case list item (summary)
/// </summary>
public class CaseListItem
{
    public Guid Id { get; set; }
    public string CaseNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public CaseStatus Status { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ResponsibleLawyerName { get; set; } = string.Empty;
    public DateTime? NextDeadline { get; set; }
    public DateTime OpeningDate { get; set; }
    public DateTime? LastActivity { get; set; }
}

/// <summary>
/// Client summary DTO
/// </summary>
public class ClientSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

/// <summary>
/// User summary DTO
/// </summary>
public class UserSummaryDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public UserRole Role { get; set; }
}
