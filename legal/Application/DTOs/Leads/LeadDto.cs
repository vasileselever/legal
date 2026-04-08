using System.ComponentModel.DataAnnotations;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Application.DTOs.Leads;

/// <summary>
/// DTO for lead list display
/// </summary>
public class LeadListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public LeadSource Source { get; set; }
    public string? SourceDetails { get; set; }
    public LeadStatus Status { get; set; }
    public int Score { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public LeadUrgency Urgency { get; set; }
    public Guid? AssignedTo { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? NextConsultation { get; set; }
    public int UnreadMessages { get; set; }
}

/// <summary>
/// DTO for detailed lead view
/// </summary>
public class LeadDetailDto
{
    public Guid Id { get; set; }
    public Guid FirmId { get; set; }
    
    // Contact Information
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    
    // Lead Details
    public LeadSource Source { get; set; }
    public string? SourceDetails { get; set; }
    public LeadStatus Status { get; set; }
    public int Score { get; set; }
    
    // Legal Issue
    public PracticeArea PracticeArea { get; set; }
    public string Description { get; set; } = string.Empty;
    public LeadUrgency Urgency { get; set; }
    
    // Budget & Qualification
    public string? BudgetRange { get; set; }
    public string? PreferredContactMethod { get; set; }
    
    // Assignment
    public Guid? AssignedTo { get; set; }
    public string? AssignedToName { get; set; }
    
    // Conversion
    public Guid? ConvertedToClientId { get; set; }
    public DateTime? ConvertedAt { get; set; }
    
    // GDPR
    public bool ConsentToMarketing { get; set; }
    public bool ConsentToDataProcessing { get; set; }
    
    // Counts
    public int ConversationCount { get; set; }
    public int DocumentCount { get; set; }
    public int ConsultationCount { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    
    // Related data
    public List<LeadConversationDto> RecentConversations { get; set; } = new();
    public List<ConsultationDto> Consultations { get; set; } = new();
    public List<LeadActivityDto> Activities { get; set; } = new();
}

/// <summary>
/// DTO for creating a lead
/// </summary>
public class CreateLeadDto
{
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone is required")]
    [Phone]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    // Client type & fiscal details
    public bool IsCorporate { get; set; } = false;
    [MaxLength(300)] public string? Address { get; set; }
    [MaxLength(100)] public string? City { get; set; }
    [MaxLength(50)]  public string? FiscalCode { get; set; }
    [MaxLength(50)]  public string? RegistrationCode { get; set; }
    [MaxLength(100)] public string? Bank { get; set; }
    [MaxLength(50)]  public string? BankAccount { get; set; }

    [Required]
    public LeadSource Source { get; set; }

    [MaxLength(200)]
    public string? SourceDetails { get; set; }

    [Required]
    public PracticeArea PracticeArea { get; set; }

    [Required(ErrorMessage = "Description is required")]
    [MinLength(10, ErrorMessage = "Please describe your issue in at least 10 characters")]
    public string Description { get; set; } = string.Empty;

    public LeadUrgency Urgency { get; set; } = LeadUrgency.Medium;

    [MaxLength(50)]
    public string? BudgetRange { get; set; }

    [MaxLength(20)]
    public string? PreferredContactMethod { get; set; }

    public Guid? AssignedTo { get; set; }

    public bool ConsentToMarketing { get; set; }

    [Range(typeof(bool), "true", "true", ErrorMessage = "You must consent to data processing")]
    public bool ConsentToDataProcessing { get; set; }

    public string? CustomFieldsJson { get; set; }
}

/// <summary>
/// DTO for updating a lead
/// </summary>
public class UpdateLeadDto
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [EmailAddress]
    [MaxLength(100)]
    public string? Email { get; set; }

    [Phone]
    [MaxLength(20)]
    public string? Phone { get; set; }

    public LeadStatus? Status { get; set; }
    public PracticeArea? PracticeArea { get; set; }

    [MinLength(10)]
    public string? Description { get; set; }

    public LeadUrgency? Urgency { get; set; }

    [MaxLength(50)]
    public string? BudgetRange { get; set; }

    public Guid? AssignedTo { get; set; }

    [Range(0, 100, ErrorMessage = "Score must be between 0 and 100")]
    public int? Score { get; set; }
}

/// <summary>
/// DTO for lead conversation messages
/// </summary>
public class LeadConversationDto
{
    public Guid Id { get; set; }
    public MessageChannel Channel { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Sender { get; set; }
    public bool IsFromLead { get; set; }
    public DateTime MessageTimestamp { get; set; }
    public string? AttachmentUrl { get; set; }
    public bool IsRead { get; set; }
}

/// <summary>
/// DTO for creating a lead message
/// </summary>
public class CreateLeadMessageDto
{
    [Required]
    public Guid LeadId { get; set; }

    [Required]
    public MessageChannel Channel { get; set; }

    [Required(ErrorMessage = "Message cannot be empty")]
    [MaxLength(4000)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }
}

/// <summary>
/// DTO for consultation
/// </summary>
public class ConsultationDto
{
    public Guid Id { get; set; }
    public Guid LeadId { get; set; }
    public string LeadName { get; set; } = string.Empty;   // never null ? always serialized
    public string LeadEmail { get; set; } = string.Empty;  // never null ? always serialized
    public Guid LawyerId { get; set; }
    public string LawyerName { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public ConsultationType Type { get; set; }
    public ConsultationStatus Status { get; set; }
    public string? VideoMeetingLink { get; set; }
    public string? Location { get; set; }
    public bool IsConfirmed { get; set; }
    public string? ConsultationNotes { get; set; }
}

/// <summary>
/// DTO for creating a consultation
/// </summary>
public class CreateConsultationDto
{
    [Required]
    public Guid LeadId { get; set; }

    [Required]
    public Guid LawyerId { get; set; }

    [Required]
    public DateTime ScheduledAt { get; set; }

    [Range(15, 120, ErrorMessage = "Duration must be between 15 and 120 minutes")]
    public int DurationMinutes { get; set; } = 30;

    [Required]
    public ConsultationType Type { get; set; }

    [MaxLength(300)]
    public string? Location { get; set; }

    [MaxLength(1000)]
    public string? PreparationNotes { get; set; }

    /// <summary>
    /// When true the backend sends a confirmation notification email to the lead.
    /// </summary>
    public bool SendNotification { get; set; } = false;
}

/// <summary>
/// DTO for updating a consultation
/// </summary>
public class UpdateConsultationDto
{
    [Required]
    public Guid LawyerId { get; set; }

    [Required]
    public DateTime ScheduledAt { get; set; }

    [Range(15, 120, ErrorMessage = "Duration must be between 15 and 120 minutes")]
    public int DurationMinutes { get; set; } = 30;

    [Required]
    public ConsultationType Type { get; set; }

    [MaxLength(300)]
    public string? Location { get; set; }

    [MaxLength(1000)]
    public string? PreparationNotes { get; set; }

    /// <summary>
    /// When true the backend sends a reschedule notification email to the lead.
    /// </summary>
    public bool SendNotification { get; set; } = false;
}

/// <summary>
/// DTO for lead activity
/// </summary>
public class LeadActivityDto
{
    public Guid Id { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for conflict check result
/// </summary>
public class ConflictCheckDto
{
    public Guid Id { get; set; }
    public ConflictCheckStatus Status { get; set; }
    public ConflictType? ConflictType { get; set; }
    public string? ConflictDescription { get; set; }
    public string? OpposingPartyName { get; set; }
    public bool HasConflict { get; set; }
    public string? Resolution { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for a document attached to a lead
/// </summary>
public class LeadDocumentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? FileType { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for lead statistics
/// </summary>
public class LeadStatisticsDto
{
    public int TotalLeads { get; set; }
    public int NewLeads { get; set; }
    public int QualifiedLeads { get; set; }
    public int ConsultationsScheduled { get; set; }
    public int ConvertedLeads { get; set; }
    public int LostLeads { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal AverageScore { get; set; }
    public Dictionary<LeadSource, int> LeadsBySource { get; set; } = new();
    public Dictionary<PracticeArea, int> LeadsByPracticeArea { get; set; } = new();
}

/// <summary>
/// DTO for converting a lead to a client
/// </summary>
public class ConvertToClientDto
{
    [Required(ErrorMessage = "Client name is required")]
    [MaxLength(200)]
    public string ClientName { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(100)]
    public string? ClientEmail { get; set; }

    [MaxLength(20)]
    public string? ClientPhone { get; set; }

    public bool IsCorporate { get; set; } = false;
    [MaxLength(300)] public string? Address { get; set; }
    [MaxLength(100)] public string? City { get; set; }
    [MaxLength(50)]  public string? FiscalCode { get; set; }
    [MaxLength(50)]  public string? RegistrationCode { get; set; }
    [MaxLength(100)] public string? Bank { get; set; }
    [MaxLength(50)]  public string? BankAccount { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

/// <summary>
/// Compact summary of a prior lead from the same person (same email or phone)
/// </summary>
public class PriorLeadDto
{
    public Guid Id { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public LeadStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? AssignedToName { get; set; }
    public bool IsConverted => Status == LeadStatus.Converted;
}

/// <summary>
/// Response returned after successfully creating a lead.
/// Includes the new lead ID and any prior leads found for the same contact.
/// </summary>
public class CreateLeadResponseDto
{
    public Guid LeadId { get; set; }
    public List<PriorLeadDto> PriorLeads { get; set; } = new();
    public bool HasPriorLeads => PriorLeads.Count > 0;
}
