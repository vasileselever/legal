using System.ComponentModel.DataAnnotations;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Application.DTOs.Campaigns;

/// <summary>
/// DTO for campaign list
/// </summary>
public class CampaignListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CampaignType Type { get; set; }
    public CampaignStatus Status { get; set; }
    public int TotalSent { get; set; }
    public int TotalOpened { get; set; }
    public int TotalClicked { get; set; }
    public int TotalConverted { get; set; }
    public decimal OpenRate { get; set; }
    public decimal ClickRate { get; set; }
    public decimal ConversionRate { get; set; }
    public int ActiveEnrollments { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for campaign details
/// </summary>
public class CampaignDetailDto
{
    public Guid Id { get; set; }
    public Guid FirmId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CampaignType Type { get; set; }
    public CampaignStatus Status { get; set; }
    public string? TriggerEvent { get; set; }
    public PracticeArea? PracticeAreaFilter { get; set; }
    public int TotalSent { get; set; }
    public int TotalOpened { get; set; }
    public int TotalClicked { get; set; }
    public int TotalConverted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public List<CampaignMessageDto> Messages { get; set; } = new();
}

/// <summary>
/// DTO for creating a campaign
/// </summary>
public class CreateCampaignDto
{
    [Required(ErrorMessage = "Campaign name is required")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public CampaignType Type { get; set; }

    [MaxLength(100)]
    public string? TriggerEvent { get; set; }

    public PracticeArea? PracticeAreaFilter { get; set; }
}

/// <summary>
/// DTO for updating a campaign
/// </summary>
public class UpdateCampaignDto
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? TriggerEvent { get; set; }

    public PracticeArea? PracticeAreaFilter { get; set; }
}

/// <summary>
/// DTO for campaign message
/// </summary>
public class CampaignMessageDto
{
    public Guid Id { get; set; }
    public int StepNumber { get; set; }
    public int DelayDays { get; set; }
    public MessageChannel Channel { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int SentCount { get; set; }
    public int OpenCount { get; set; }
    public int ClickCount { get; set; }
}

/// <summary>
/// DTO for creating campaign message
/// </summary>
public class CreateCampaignMessageDto
{
    [Required]
    public Guid CampaignId { get; set; }

    [Range(1, 100, ErrorMessage = "Step number must be between 1 and 100")]
    public int StepNumber { get; set; }

    [Range(0, 365, ErrorMessage = "Delay must be between 0 and 365 days")]
    public int DelayDays { get; set; }

    [Required]
    public MessageChannel Channel { get; set; }

    [MaxLength(200)]
    public string? Subject { get; set; }

    [Required(ErrorMessage = "Message body is required")]
    [MinLength(10)]
    public string Body { get; set; } = string.Empty;
}

/// <summary>
/// DTO for intake form
/// </summary>
public class IntakeFormDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PracticeArea? PracticeArea { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public string FormFieldsJson { get; set; } = string.Empty;
    public string? ThankYouMessage { get; set; }
    public int TotalSubmissions { get; set; }
    public int TotalConversions { get; set; }
    public decimal ConversionRate { get; set; }
}

/// <summary>
/// DTO for creating intake form
/// </summary>
public class CreateIntakeFormDto
{
    [Required(ErrorMessage = "Form name is required")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public PracticeArea? PracticeArea { get; set; }

    [Required(ErrorMessage = "Form fields configuration is required")]
    public string FormFieldsJson { get; set; } = string.Empty;

    public string? ConditionalLogicJson { get; set; }

    [MaxLength(1000)]
    public string? ThankYouMessage { get; set; }

    [MaxLength(2000)]
    public string? AutoResponderTemplate { get; set; }
}
