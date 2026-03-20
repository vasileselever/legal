using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.Billing;

/// <summary>
/// Ledger entry on a trust account (deposit, withdrawal, transfer, etc.).
/// </summary>
public class TrustTransaction : BaseEntity
{
    public Guid TrustAccountId { get; set; }

    public TrustTransactionType TransactionType { get; set; }

    public DateTime TransactionDate { get; set; }

    /// <summary>
    /// Positive = credit, Negative = debit
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Running balance after this transaction
    /// </summary>
    public decimal RunningBalance { get; set; }

    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// External bank reference
    /// </summary>
    public string? Reference { get; set; }

    /// <summary>
    /// If this withdrawal paid an invoice
    /// </summary>
    public Guid? PaymentId { get; set; }

    /// <summary>
    /// User who performed the transaction
    /// </summary>
    public Guid PerformedByUserId { get; set; }

    // Navigation
    public TrustAccount TrustAccount { get; set; } = null!;
    public Payment? Payment { get; set; }
    public User PerformedByUser { get; set; } = null!;
}
