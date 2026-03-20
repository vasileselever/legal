using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.Billing;

/// <summary>
/// A recorded unit of billable (or non-billable) work.
/// </summary>
public class TimeEntry : BaseEntity
{
    public Guid FirmId { get; set; }
    public Guid UserId { get; set; }
    public Guid CaseId { get; set; }

    /// <summary>
    /// Date the work was performed
    /// </summary>
    public DateTime WorkDate { get; set; }

    /// <summary>
    /// Duration in hours (e.g. 1.5 = 1h 30m)
    /// </summary>
    public decimal DurationHours { get; set; }

    /// <summary>
    /// Description of the work performed
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Activity code for categorisation (e.g. "RESEARCH", "DRAFTING", "COURT")
    /// </summary>
    public string? ActivityCode { get; set; }

    public bool IsBillable { get; set; } = true;

    /// <summary>
    /// Hourly rate applied at the time of entry (snapshot)
    /// </summary>
    public decimal HourlyRate { get; set; }

    public Currency Currency { get; set; } = Currency.RON;

    /// <summary>
    /// Computed: DurationHours * HourlyRate
    /// </summary>
    public decimal TotalAmount => DurationHours * HourlyRate;

    public TimeEntryStatus Status { get; set; } = TimeEntryStatus.Draft;

    /// <summary>
    /// Link to the invoice line item once billed
    /// </summary>
    public Guid? InvoiceLineItemId { get; set; }

    /// <summary>
    /// Timer start (null when entry was created manually)
    /// </summary>
    public DateTime? TimerStart { get; set; }

    /// <summary>
    /// Timer stop
    /// </summary>
    public DateTime? TimerStop { get; set; }

    // Navigation
    public Firm Firm { get; set; } = null!;
    public User User { get; set; } = null!;
    public Case Case { get; set; } = null!;
    public InvoiceLineItem? InvoiceLineItem { get; set; }
}
