using LegalRO.CaseManagement.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace LegalRO.CaseManagement.Application.DTOs.Billing;

// >> Time Entry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

public class TimeEntryDto
{
    public Guid Id { get; set; }
    public Guid? CaseId { get; set; }
    public string? CaseNumber { get; set; }
    public string? CaseTitle { get; set; }
    public Guid? LeadId { get; set; }
    public string? LeadName { get; set; }
    public Guid UserId { get; set; }
    public string? UserFullName { get; set; }
    public DateTime WorkDate { get; set; }
    public decimal DurationHours { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ActivityCode { get; set; }
    public bool IsBillable { get; set; }
    public decimal HourlyRate { get; set; }
    public Currency Currency { get; set; }
    public decimal TotalAmount { get; set; }
    public TimeEntryStatus Status { get; set; }
    public DateTime? TimerStart { get; set; }
    public DateTime? TimerStop { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTimeEntryRequest
{
    public Guid? CaseId { get; set; }
    public Guid? LeadId { get; set; }
    [Required] public DateTime WorkDate { get; set; }
    [Required][Range(0.01, 24)] public decimal DurationHours { get; set; }
    [Required][MaxLength(2000)] public string Description { get; set; } = string.Empty;
    [MaxLength(50)] public string? ActivityCode { get; set; }
    public bool IsBillable { get; set; } = true;
    public decimal? HourlyRateOverride { get; set; }
    public Currency Currency { get; set; } = Currency.RON;
}

public class UpdateTimeEntryRequest
{
    [Required] public DateTime WorkDate { get; set; }
    [Required][Range(0.01, 24)] public decimal DurationHours { get; set; }
    [Required][MaxLength(2000)] public string Description { get; set; } = string.Empty;
    [MaxLength(50)] public string? ActivityCode { get; set; }
    public bool IsBillable { get; set; } = true;
    public decimal? HourlyRateOverride { get; set; }
}

public class StartTimerRequest
{
    public Guid? CaseId { get; set; }
    public Guid? LeadId { get; set; }
    [MaxLength(2000)] public string? Description { get; set; }
    [MaxLength(50)] public string? ActivityCode { get; set; }
    public bool IsBillable { get; set; } = true;
}

public class StopTimerRequest
{
    [MaxLength(2000)] public string? Description { get; set; }
}

// >> Expense >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

public class ExpenseDto
{
    public Guid Id { get; set; }
    public Guid? CaseId { get; set; }
    public string? CaseNumber { get; set; }
    public string? CaseTitle { get; set; }
    public Guid? LeadId { get; set; }
    public string? LeadName { get; set; }
    public Guid UserId { get; set; }
    public string? UserFullName { get; set; }
    public DateTime ExpenseDate { get; set; }
    public ExpenseCategory Category { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Currency Currency { get; set; }
    public decimal MarkupPercent { get; set; }
    public decimal BillableAmount { get; set; }
    public bool IsBillable { get; set; }
    public ExpenseStatus Status { get; set; }
    public string? ReceiptFilePath { get; set; }
    public string? Vendor { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExpenseRequest
{
    public Guid? CaseId { get; set; }
    public Guid? LeadId { get; set; }
    [Required] public DateTime ExpenseDate { get; set; }
    [Required] public ExpenseCategory Category { get; set; }
    [MaxLength(1000)] public string Description { get; set; } = string.Empty;
    [Required][Range(0.01, double.MaxValue)] public decimal Amount { get; set; }
    public Currency Currency { get; set; } = Currency.RON;
    [Range(0, 100)] public decimal MarkupPercent { get; set; }
    public bool IsBillable { get; set; } = true;
    [MaxLength(500)] public string? ReceiptFilePath { get; set; }
    [MaxLength(200)] public string? Vendor { get; set; }
}

public class UpdateExpenseRequest
{
    [Required] public DateTime ExpenseDate { get; set; }
    [Required] public ExpenseCategory Category { get; set; }
    [MaxLength(1000)] public string Description { get; set; } = string.Empty;
    [Required][Range(0.01, double.MaxValue)] public decimal Amount { get; set; }
    [Range(0, 100)] public decimal MarkupPercent { get; set; }
    public bool IsBillable { get; set; } = true;
    [MaxLength(500)] public string? ReceiptFilePath { get; set; }
    [MaxLength(200)] public string? Vendor { get; set; }
    public ExpenseStatus? Status { get; set; }
}

// >> Invoice >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public string? ClientName { get; set; }
    public Guid? CaseId { get; set; }
    public string? CaseNumber { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public InvoiceStatus Status { get; set; }
    public Currency Currency { get; set; }
    public decimal SubTotal { get; set; }
    public decimal VatPercent { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal WriteOffAmount { get; set; }
    public decimal BalanceDue { get; set; }
    public DateTime? PeriodStart { get; set; }
    public DateTime? PeriodEnd { get; set; }
    public string? Notes { get; set; }
    public string? EFacturaId { get; set; }
    public DateTime? SentAt { get; set; }
    public List<InvoiceLineItemDto> LineItems { get; set; } = new();
    public List<PaymentSummaryDto> Payments { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class InvoiceListItemDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string? CaseNumber { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public InvoiceStatus Status { get; set; }
    public Currency Currency { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal BalanceDue { get; set; }
}

public class InvoiceLineItemDto
{
    public Guid Id { get; set; }
    public int LineNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
    public string LineType { get; set; } = "Time";
    public Guid? TimeEntryId { get; set; }
    public Guid? ExpenseId { get; set; }
}

public class CreateInvoiceRequest
{
    [Required] public Guid ClientId { get; set; }
    public Guid? CaseId { get; set; }
    [Required] public DateTime DueDate { get; set; }
    public Currency Currency { get; set; } = Currency.RON;
    [Range(0, 100)] public decimal VatPercent { get; set; } = 19m;
    public DateTime? PeriodStart { get; set; }
    public DateTime? PeriodEnd { get; set; }
    [MaxLength(2000)] public string? Notes { get; set; }

    /// <summary>
    /// Time entry IDs to include in the invoice
    /// </summary>
    public List<Guid>? TimeEntryIds { get; set; }

    /// <summary>
    /// Expense IDs to include in the invoice
    /// </summary>
    public List<Guid>? ExpenseIds { get; set; }

    /// <summary>
    /// Manual line items (flat-fee, discount, etc.)
    /// </summary>
    public List<ManualLineItemRequest>? ManualLineItems { get; set; }
}

public class ManualLineItemRequest
{
    [Required][MaxLength(1000)] public string Description { get; set; } = string.Empty;
    [Required] public decimal Quantity { get; set; } = 1;
    [Required] public decimal UnitPrice { get; set; }
    public string LineType { get; set; } = "FlatFee";
}

// >> Payment >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }
    public Guid ClientId { get; set; }
    public string? ClientName { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public Currency Currency { get; set; }
    public PaymentMethod Method { get; set; }
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PaymentSummaryDto
{
    public Guid Id { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
}

public class RecordPaymentRequest
{
    [Required] public Guid InvoiceId { get; set; }
    [Required] public DateTime PaymentDate { get; set; }
    [Required][Range(0.01, double.MaxValue)] public decimal Amount { get; set; }
    public Currency Currency { get; set; } = Currency.RON;
    [Required] public PaymentMethod Method { get; set; }
    [MaxLength(200)] public string? TransactionReference { get; set; }
    [MaxLength(1000)] public string? Notes { get; set; }
    /// <summary>
    /// If paying from trust account
    /// </summary>
    public Guid? TrustAccountId { get; set; }
}

// >> Trust Account >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

public class TrustAccountDto
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string? ClientName { get; set; }
    public string AccountReference { get; set; } = string.Empty;
    public Currency Currency { get; set; }
    public decimal Balance { get; set; }
    public decimal MinimumBalance { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTrustAccountRequest
{
    [Required] public Guid ClientId { get; set; }
    public Currency Currency { get; set; } = Currency.RON;
    [Range(0, double.MaxValue)] public decimal MinimumBalance { get; set; }
    [MaxLength(1000)] public string? Notes { get; set; }
}

public class TrustTransactionDto
{
    public Guid Id { get; set; }
    public Guid TrustAccountId { get; set; }
    public TrustTransactionType TransactionType { get; set; }
    public DateTime TransactionDate { get; set; }
    public decimal Amount { get; set; }
    public decimal RunningBalance { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Reference { get; set; }
    public string? PerformedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTrustTransactionRequest
{
    [Required] public Guid TrustAccountId { get; set; }
    [Required] public TrustTransactionType TransactionType { get; set; }
    [Required] public DateTime TransactionDate { get; set; }
    [Required][Range(0.01, double.MaxValue)] public decimal Amount { get; set; }
    [Required][MaxLength(1000)] public string Description { get; set; } = string.Empty;
    [MaxLength(200)] public string? Reference { get; set; }
}

// >> Billing Rate >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

public class BillingRateDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? UserFullName { get; set; }
    public Guid? ClientId { get; set; }
    public string? ClientName { get; set; }
    public Guid? CaseId { get; set; }
    public string? CaseNumber { get; set; }
    public decimal Rate { get; set; }
    public Currency Currency { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public string? Description { get; set; }
}

public class CreateBillingRateRequest
{
    public Guid? UserId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? CaseId { get; set; }
    [Required][Range(0.01, double.MaxValue)] public decimal Rate { get; set; }
    public Currency Currency { get; set; } = Currency.RON;
    [Required] public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    [MaxLength(500)] public string? Description { get; set; }
}

// >> Reporting >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

public class BillingSummaryDto
{
    public decimal TotalWip { get; set; }
    public decimal TotalBilled { get; set; }
    public decimal TotalCollected { get; set; }
    public decimal TotalOutstanding { get; set; }
    public decimal RealizationRate { get; set; }
    public decimal CollectionRate { get; set; }
    public int OverdueInvoiceCount { get; set; }
    public decimal TrustAccountsBalance { get; set; }
}

public class LawyerProductivityDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public decimal BillableHours { get; set; }
    public decimal NonBillableHours { get; set; }
    public decimal UtilizationRate { get; set; }
    public decimal BilledAmount { get; set; }
    public decimal CollectedAmount { get; set; }
}

public class ArAgingDto
{
    public decimal Current { get; set; }       // 0-30 days
    public decimal ThirtyDays { get; set; }    // 31-60
    public decimal SixtyDays { get; set; }     // 61-90
    public decimal NinetyPlusDays { get; set; }// 90+
    public decimal Total { get; set; }
}
