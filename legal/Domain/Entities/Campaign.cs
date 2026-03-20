using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Marketing campaign entity (email/SMS drip campaigns)
/// </summary>
public class Campaign : BaseEntity
{
    public Guid FirmId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CampaignType Type { get; set; }
    public CampaignStatus Status { get; set; } = CampaignStatus.Draft;
    
    // Trigger settings
    public string? TriggerEvent { get; set; } // "LeadCreated", "ConsultationCompleted", etc.
    public PracticeArea? PracticeAreaFilter { get; set; } // Only for specific practice areas
    
    // Statistics
    public int TotalSent { get; set; } = 0;
    public int TotalOpened { get; set; } = 0;
    public int TotalClicked { get; set; } = 0;
    public int TotalConverted { get; set; } = 0;
    
    // Navigation Properties
    public Firm Firm { get; set; } = null!;
    public ICollection<CampaignMessage> Messages { get; set; } = new List<CampaignMessage>();
    public ICollection<CampaignEnrollment> Enrollments { get; set; } = new List<CampaignEnrollment>();
}

/// <summary>
/// Individual messages in a campaign sequence
/// </summary>
public class CampaignMessage : BaseEntity
{
    public Guid CampaignId { get; set; }
    
    public int StepNumber { get; set; } // 1, 2, 3... (order in sequence)
    public int DelayDays { get; set; } = 0; // Days after previous message (0 = immediate)
    public MessageChannel Channel { get; set; }
    
    // Content
    public string Subject { get; set; } = string.Empty; // For email
    public string Body { get; set; } = string.Empty;
    public string? TemplateVariables { get; set; } // JSON: {FirstName}, {LawyerName}, etc.
    
    // Statistics
    public int SentCount { get; set; } = 0;
    public int OpenCount { get; set; } = 0;
    public int ClickCount { get; set; } = 0;
    
    // Navigation Properties
    public Campaign Campaign { get; set; } = null!;
}

/// <summary>
/// Lead enrollment in a campaign (tracks progress)
/// </summary>
public class CampaignEnrollment : BaseEntity
{
    public Guid CampaignId { get; set; }
    public Guid LeadId { get; set; }
    
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public int CurrentStep { get; set; } = 0; // Current message step
    public DateTime? LastMessageSentAt { get; set; }
    public DateTime? NextMessageDue { get; set; }
    
    public bool IsActive { get; set; } = true;
    public bool IsCompleted { get; set; } = false;
    public bool IsUnsubscribed { get; set; } = false;
    public DateTime? UnsubscribedAt { get; set; }
    
    // Navigation Properties
    public Campaign Campaign { get; set; } = null!;
    public Lead Lead { get; set; } = null!;
}

/// <summary>
/// Intake form configuration (customizable forms per firm)
/// </summary>
public class IntakeForm : BaseEntity
{
    public Guid FirmId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PracticeArea? PracticeArea { get; set; } // Specific to practice area or general
    
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    
    // Form configuration (JSON)
    public string FormFieldsJson { get; set; } = string.Empty; // Dynamic form fields
    public string? ConditionalLogicJson { get; set; } // Conditional field display logic
    
    // Styling
    public string? CustomCss { get; set; }
    public string? ThankYouMessage { get; set; }
    public string? AutoResponderTemplate { get; set; }
    
    // Statistics
    public int TotalSubmissions { get; set; } = 0;
    public int TotalConversions { get; set; } = 0;
    
    // Navigation Properties
    public Firm Firm { get; set; } = null!;
    public ICollection<IntakeFormSubmission> Submissions { get; set; } = new List<IntakeFormSubmission>();
}

/// <summary>
/// Individual form submissions (raw data capture)
/// </summary>
public class IntakeFormSubmission : BaseEntity
{
    public Guid IntakeFormId { get; set; }
    public Guid FirmId { get; set; }
    public Guid LeadId { get; set; }
    
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public string FormDataJson { get; set; } = string.Empty; // Raw form data
    
    // Request metadata
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Referrer { get; set; }
    
    // Navigation Properties
    public IntakeForm IntakeForm { get; set; } = null!;
    public Firm Firm { get; set; } = null!;
    public Lead Lead { get; set; } = null!;
}
