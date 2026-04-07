using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Application.Services;

/// <summary>
/// Service interface for the Billing & Financial Management platform.
/// </summary>
public interface IBillingService
{
    // >> Time Entries >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Task<TimeEntryDto> CreateTimeEntryAsync(Guid firmId, Guid userId, CreateTimeEntryRequest request);
    Task<TimeEntryDto> UpdateTimeEntryAsync(Guid firmId, Guid userId, Guid id, UpdateTimeEntryRequest request);
    Task DeleteTimeEntryAsync(Guid firmId, Guid userId, Guid id);
    Task<TimeEntryDto> GetTimeEntryAsync(Guid firmId, Guid id);
    Task<PagedResponse<TimeEntryDto>> GetTimeEntriesAsync(Guid firmId, Guid? userId, Guid? caseId,
        TimeEntryStatus? status, DateTime? from, DateTime? to, bool? isBillable,
        int page = 1, int pageSize = 25);
    Task<TimeEntryDto> StartTimerAsync(Guid firmId, Guid userId, StartTimerRequest request);
    Task<TimeEntryDto> StopTimerAsync(Guid firmId, Guid userId, Guid id, StopTimerRequest request);
    Task SubmitTimeEntriesAsync(Guid firmId, Guid userId, List<Guid> ids);
    Task ApproveTimeEntriesAsync(Guid firmId, Guid userId, List<Guid> ids);
    Task RejectTimeEntriesAsync(Guid firmId, Guid userId, List<Guid> ids, string reason);

    // >> Expenses >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Task<ExpenseDto> CreateExpenseAsync(Guid firmId, Guid userId, CreateExpenseRequest request);
    Task<ExpenseDto> UpdateExpenseAsync(Guid firmId, Guid userId, Guid id, UpdateExpenseRequest request);
    Task DeleteExpenseAsync(Guid firmId, Guid userId, Guid id);
    Task<ExpenseDto> GetExpenseAsync(Guid firmId, Guid id);
    Task<PagedResponse<ExpenseDto>> GetExpensesAsync(Guid firmId, Guid? userId, Guid? caseId,
        ExpenseStatus? status, ExpenseCategory? category, DateTime? from, DateTime? to,
        int page = 1, int pageSize = 25);
    Task ApproveExpensesAsync(Guid firmId, Guid userId, List<Guid> ids);

    // >> Invoices >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Task<InvoiceDto> CreateInvoiceAsync(Guid firmId, Guid userId, CreateInvoiceRequest request);
    Task<InvoiceDto> GetInvoiceAsync(Guid firmId, Guid id);
    Task<PagedResponse<InvoiceListItemDto>> GetInvoicesAsync(Guid firmId, Guid? clientId, Guid? caseId,
        InvoiceStatus? status, DateTime? from, DateTime? to,
        int page = 1, int pageSize = 25);
    Task<InvoiceDto> SendInvoiceAsync(Guid firmId, Guid userId, Guid id);
    Task<InvoiceDto> CancelInvoiceAsync(Guid firmId, Guid userId, Guid id);

    // >> Payments >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Task<PaymentDto> RecordPaymentAsync(Guid firmId, Guid userId, RecordPaymentRequest request);
    Task<PagedResponse<PaymentDto>> GetPaymentsAsync(Guid firmId, Guid? clientId, Guid? invoiceId,
        DateTime? from, DateTime? to, int page = 1, int pageSize = 25);

    // >> Trust Accounts >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Task<TrustAccountDto> CreateTrustAccountAsync(Guid firmId, Guid userId, CreateTrustAccountRequest request);
    Task<TrustAccountDto> GetTrustAccountAsync(Guid firmId, Guid id);
    Task<List<TrustAccountDto>> GetTrustAccountsAsync(Guid firmId, Guid? clientId);
    Task<TrustTransactionDto> CreateTrustTransactionAsync(Guid firmId, Guid userId, CreateTrustTransactionRequest request);
    Task<PagedResponse<TrustTransactionDto>> GetTrustTransactionsAsync(Guid firmId, Guid trustAccountId,
        int page = 1, int pageSize = 25);

    // >> Billing Rates >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Task<BillingRateDto> CreateBillingRateAsync(Guid firmId, Guid userId, CreateBillingRateRequest request);
    Task<List<BillingRateDto>> GetBillingRatesAsync(Guid firmId, Guid? userId, Guid? clientId, Guid? caseId);
    Task DeleteBillingRateAsync(Guid firmId, Guid id);

    // >> Reporting >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Task<BillingSummaryDto> GetBillingSummaryAsync(Guid firmId, DateTime? from, DateTime? to);
    Task<List<LawyerProductivityDto>> GetLawyerProductivityAsync(Guid firmId, DateTime from, DateTime to);
    Task<ArAgingDto> GetArAgingAsync(Guid firmId);
}
