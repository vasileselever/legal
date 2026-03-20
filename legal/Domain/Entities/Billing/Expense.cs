using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.Billing;

/// <summary>
/// Expense incurred on behalf of a client/case.
/// </summary>
public class Expense : BaseEntity
{
    public Guid FirmId { get; set; }
    public Guid CaseId { get; set; }
    public Guid UserId { get; set; }

    public DateTime ExpenseDate { get; set; }
    public ExpenseCategory Category { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Currency Currency { get; set; } = Currency.RON;

    /// <summary>
    /// Markup percentage (e.g. 10 for 10%)
    /// </summary>
    public decimal MarkupPercent { get; set; }

    /// <summary>
    /// Amount + Markup
    /// </summary>
    public decimal BillableAmount => Amount * (1 + MarkupPercent / 100m);

    public bool IsBillable { get; set; } = true;
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Pending;

    /// <summary>
    /// Receipt file path (photo upload)
    /// </summary>
    public string? ReceiptFilePath { get; set; }

    /// <summary>
    /// Vendor / payee name
    /// </summary>
    public string? Vendor { get; set; }

    /// <summary>
    /// Link to the invoice line item once billed
    /// </summary>
    public Guid? InvoiceLineItemId { get; set; }

    // Navigation
    public Firm Firm { get; set; } = null!;
    public Case Case { get; set; } = null!;
    public User User { get; set; } = null!;
    public InvoiceLineItem? InvoiceLineItem { get; set; }
}
