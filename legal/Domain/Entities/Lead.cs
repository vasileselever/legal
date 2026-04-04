using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Lead entity representing a prospective client inquiry
/// </summary>
public class Lead : BaseEntity
{
    public Guid FirmId { get; set; }
    
    // Contact Information
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    
    // Lead Details
    public LeadSource Source { get; set; }
    public string? SourceDetails { get; set; } // Campaign name, referral source, etc.
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public int Score { get; set; } = 0; // 0-100 lead scoring
    
    // Legal Issue
    public PracticeArea PracticeArea { get; set; }
    public string Description { get; set; } = string.Empty;
    public LeadUrgency Urgency { get; set; } = LeadUrgency.Medium;
    
    // Budget & Qualification
    public string? BudgetRange { get; set; } // e.g., "5000-10000 RON"
    public string? PreferredContactMethod { get; set; } // Email, Phone, WhatsApp
    
    // Assignment
    public Guid? AssignedTo { get; set; } // Assigned lawyer
    
    // Conversion
    public Guid? ConvertedToClientId { get; set; }
    public DateTime? ConvertedAt { get; set; }
    
    // Metadata
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? CustomFieldsJson { get; set; } // JSON for flexible custom fields
    
    // GDPR Consent
    public bool ConsentToMarketing { get; set; } = false;
    public bool ConsentToDataProcessing { get; set; } = false;
    public DateTime? ConsentDate { get; set; }
    
    // Navigation Properties
    public Firm Firm { get; set; } = null!;
    public User? AssignedLawyer { get; set; }
    public Client? ConvertedClient { get; set; }
    
    public ICollection<LeadConversation> Conversations { get; set; } = new List<LeadConversation>();
    public ICollection<LeadDocument> Documents { get; set; } = new List<LeadDocument>();
    public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
    public ICollection<ConflictCheck> ConflictChecks { get; set; } = new List<ConflictCheck>();
    public ICollection<LeadActivity> Activities { get; set; } = new List<LeadActivity>();
}

/// <summary>
/// Lead conversation messages (WhatsApp, Email, SMS, etc.)
/// </summary>
public class LeadConversation : BaseEntity
{
    public Guid LeadId { get; set; }
    public MessageChannel Channel { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Sender { get; set; } // "Lead" or "Firm" or user name
    public bool IsFromLead { get; set; } = true;
    public DateTime MessageTimestamp { get; set; } = DateTime.UtcNow;
    
    // Message metadata
    public string? MessageId { get; set; } // External message ID (WhatsApp, Facebook, etc.)
    public string? AttachmentUrl { get; set; }
    public bool IsRead { get; set; } = false;
    
    // Navigation Properties
    public Lead Lead { get; set; } = null!;
}

/// <summary>
/// Documents attached to leads (uploaded during intake)
/// </summary>
public class LeadDocument : BaseEntity
{
    public Guid LeadId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? FileType { get; set; }
    public string? Description { get; set; }

    /// <summary>
    /// Set when this document was produced by Document Automation.
    /// Used to show the "Ata?at la Lead" indicator in the Documents list.
    /// </summary>
    public Guid? GeneratedDocumentId { get; set; }

    // Navigation Properties
    public Lead Lead { get; set; } = null!;
}

/// <summary>
/// Consultation appointments with prospects
/// </summary>
public class Consultation : BaseEntity
{
    public Guid LeadId { get; set; }
    public Guid LawyerId { get; set; }
    
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public ConsultationType Type { get; set; }
    public ConsultationStatus Status { get; set; } = ConsultationStatus.Scheduled;
    
    // Video/Phone details
    public string? VideoMeetingLink { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Location { get; set; } // For in-person
    
    // Confirmation
    public bool IsConfirmed { get; set; } = false;
    public DateTime? ConfirmedAt { get; set; }
    
    // Reminders
    public bool Reminder24HoursSent { get; set; } = false;
    public bool Reminder1HourSent { get; set; } = false;
    
    // Notes
    public string? PreparationNotes { get; set; }
    public string? ConsultationNotes { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Navigation Properties
    public Lead Lead { get; set; } = null!;
    public User Lawyer { get; set; } = null!;
}

/// <summary>
/// Conflict of interest checks for leads
/// </summary>
public class ConflictCheck : BaseEntity
{
    public Guid LeadId { get; set; }
    public string? OpposingPartyName { get; set; }
    public ConflictCheckStatus Status { get; set; } = ConflictCheckStatus.Pending;
    public ConflictType? ConflictType { get; set; }
    
    // Conflict details
    public string? ConflictDescription { get; set; }
    public Guid? ConflictingCaseId { get; set; }
    public Guid? ConflictingClientId { get; set; }
    
    // Resolution
    public string? Resolution { get; set; } // "Declined", "Waiver obtained", etc.
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedBy { get; set; }
    
    // Waiver
    public bool WaiverRequested { get; set; } = false;
    public bool WaiverObtained { get; set; } = false;
    public DateTime? WaiverDate { get; set; }
    public string? WaiverDocumentPath { get; set; }
    
    // Navigation Properties
    public Lead Lead { get; set; } = null!;
    public Case? ConflictingCase { get; set; }
    public Client? ConflictingClient { get; set; }
    public User? ResolvedByUser { get; set; }
}

/// <summary>
/// Activity log for leads (timeline)
/// </summary>
public class LeadActivity : BaseEntity
{
    public Guid LeadId { get; set; }
    public Guid? UserId { get; set; }
    
    public string ActivityType { get; set; } = string.Empty; // "StatusChanged", "Assigned", "Called", "EmailSent", etc.
    public string Description { get; set; } = string.Empty;
    public string? Metadata { get; set; } // JSON for additional data
    
    // Navigation Properties
    public Lead Lead { get; set; } = null!;
    public User? User { get; set; }
}
