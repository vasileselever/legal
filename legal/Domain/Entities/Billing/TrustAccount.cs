using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.Billing;

/// <summary>
/// Trust (escrow / client-funds) account per client, per Romanian Bar rules.
/// </summary>
public class TrustAccount : BaseEntity
{
    public Guid FirmId { get; set; }
    public Guid ClientId { get; set; }

    /// <summary>
    /// Friendly account reference (e.g. "TA-POPESCU-001")
    /// </summary>
    public string AccountReference { get; set; } = string.Empty;

    public Currency Currency { get; set; } = Currency.RON;

    /// <summary>
    /// Current balance (updated on every transaction)
    /// </summary>
    public decimal Balance { get; set; }

    /// <summary>
    /// Minimum balance threshold; triggers notification if breached
    /// </summary>
    public decimal MinimumBalance { get; set; }

    public bool IsActive { get; set; } = true;

    public string? Notes { get; set; }

    // Navigation
    public Firm Firm { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public ICollection<TrustTransaction> Transactions { get; set; } = new List<TrustTransaction>();
}
