using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.Billing;

/// <summary>
/// Invoice header issued to a client.
/// Romanian-format legal invoice with E-FACTURA support.
/// </summary>
public class Invoice : BaseEntity
{
    public Guid FirmId { get; set; }
    public Guid ClientId { get; set; }
    public Guid? CaseId { get; set; }

    /// <summary>
    /// Sequential invoice number per firm (e.g. "LRO-2025-00042")
    /// </summary>
    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public Currency Currency { get; set; } = Currency.RON;

    /// <summary>
    /// Sum of line item amounts (before VAT)
    /// </summary>
    public decimal SubTotal { get; set; }

    /// <summary>
    /// Romanian VAT rate applied (e.g. 19)
    /// </summary>
    public decimal VatPercent { get; set; } = 19m;

    /// <summary>
    /// VAT amount = SubTotal * VatPercent / 100
    /// </summary>
    public decimal VatAmount { get; set; }

    /// <summary>
    /// Total = SubTotal + VatAmount
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Amount already paid
    /// </summary>
    public decimal PaidAmount { get; set; }

    /// <summary>
    /// Amount written-off / discount
    /// </summary>
    public decimal WriteOffAmount { get; set; }

    /// <summary>
    /// Balance due = TotalAmount - PaidAmount - WriteOffAmount
    /// </summary>
    public decimal BalanceDue => TotalAmount - PaidAmount - WriteOffAmount;

    /// <summary>
    /// Billing period start
    /// </summary>
    public DateTime? PeriodStart { get; set; }

    /// <summary>
    /// Billing period end
    /// </summary>
    public DateTime? PeriodEnd { get; set; }

    public string? Notes { get; set; }

    /// <summary>
    /// E-FACTURA XML ID once submitted
    /// </summary>
    public string? EFacturaId { get; set; }

    /// <summary>
    /// Date when invoice was sent to client
    /// </summary>
    public DateTime? SentAt { get; set; }

    /// <summary>
    /// Online payment link token
    /// </summary>
    public string? PaymentLinkToken { get; set; }

    // Navigation
    public Firm Firm { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public Case? Case { get; set; }
    public ICollection<InvoiceLineItem> LineItems { get; set; } = new List<InvoiceLineItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
