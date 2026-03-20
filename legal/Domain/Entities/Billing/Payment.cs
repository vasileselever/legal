using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.Billing;

/// <summary>
/// Payment received against an invoice.
/// </summary>
public class Payment : BaseEntity
{
    public Guid FirmId { get; set; }
    public Guid InvoiceId { get; set; }
    public Guid ClientId { get; set; }

    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public Currency Currency { get; set; } = Currency.RON;
    public PaymentMethod Method { get; set; }

    /// <summary>
    /// External transaction reference (bank ref, Stripe charge ID, etc.)
    /// </summary>
    public string? TransactionReference { get; set; }

    public string? Notes { get; set; }

    /// <summary>
    /// If the payment came from a trust account withdrawal
    /// </summary>
    public Guid? TrustTransactionId { get; set; }

    // Navigation
    public Firm Firm { get; set; } = null!;
    public Invoice Invoice { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public TrustTransaction? TrustTransaction { get; set; }
}
