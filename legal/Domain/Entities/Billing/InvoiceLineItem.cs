using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.Billing;

/// <summary>
/// Individual line item on an invoice.
/// Can reference a TimeEntry or an Expense.
/// </summary>
public class InvoiceLineItem : BaseEntity
{
    public Guid InvoiceId { get; set; }

    /// <summary>
    /// Sequential line number within the invoice
    /// </summary>
    public int LineNumber { get; set; }

    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Quantity (hours for time, 1 for expenses / flat-fee items)
    /// </summary>
    public decimal Quantity { get; set; }

    /// <summary>
    /// Unit price (hourly rate, expense amount, flat-fee)
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Line total = Quantity x UnitPrice
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// "Time", "Expense", "FlatFee", "Discount"
    /// </summary>
    public string LineType { get; set; } = "Time";

    /// <summary>
    /// Optional link to the originating TimeEntry
    /// </summary>
    public Guid? TimeEntryId { get; set; }

    /// <summary>
    /// Optional link to the originating Expense
    /// </summary>
    public Guid? ExpenseId { get; set; }

    // Navigation
    public Invoice Invoice { get; set; } = null!;
    public TimeEntry? TimeEntry { get; set; }
    public Expense? Expense { get; set; }
}
