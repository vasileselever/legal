using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.Billing;

/// <summary>
/// Billing rate per lawyer/role, optionally per client or case.
/// Supports hourly, flat-fee and other arrangements.
/// </summary>
public class BillingRate : BaseEntity
{
    public Guid FirmId { get; set; }

    /// <summary>
    /// Lawyer this rate applies to (null = firm-wide default)
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Client-specific rate override (null = standard rate)
    /// </summary>
    public Guid? ClientId { get; set; }

    /// <summary>
    /// Case-specific rate override (null = standard rate)
    /// </summary>
    public Guid? CaseId { get; set; }

    /// <summary>
    /// Rate amount in the given currency
    /// </summary>
    public decimal Rate { get; set; }

    public Currency Currency { get; set; } = Currency.RON;

    /// <summary>
    /// Effective from date
    /// </summary>
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Effective until (null = currently active)
    /// </summary>
    public DateTime? EffectiveTo { get; set; }

    public string? Description { get; set; }

    // Navigation
    public Firm Firm { get; set; } = null!;
    public User? User { get; set; }
    public Client? Client { get; set; }
    public Case? Case { get; set; }
}
