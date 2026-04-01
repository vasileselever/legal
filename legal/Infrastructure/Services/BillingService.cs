using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Entities.Billing;
using LegalRO.CaseManagement.Domain.Enums;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LegalRO.CaseManagement.Infrastructure.Services;

public class BillingService : IBillingService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<BillingService> _logger;

    public BillingService(ApplicationDbContext db, ILogger<BillingService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  TIME ENTRIES
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<TimeEntryDto> CreateTimeEntryAsync(Guid firmId, Guid userId, CreateTimeEntryRequest request)
    {
        var rate = request.HourlyRateOverride ?? await ResolveHourlyRateAsync(firmId, userId, request.CaseId);

        var entry = new TimeEntry
        {
            FirmId = firmId,
            UserId = userId,
            CaseId = request.CaseId,
            LeadId = request.LeadId,
            WorkDate = request.WorkDate,
            DurationHours = request.DurationHours,
            Description = request.Description,
            ActivityCode = request.ActivityCode,
            IsBillable = request.IsBillable,
            HourlyRate = rate,
            Currency = request.Currency,
            Status = TimeEntryStatus.Draft,
            CreatedBy = userId.ToString()
        };

        _db.TimeEntries.Add(entry);
        await _db.SaveChangesAsync();
        _logger.LogInformation("TimeEntry {Id} created by {UserId} for case {CaseId} / lead {LeadId}", entry.Id, userId, request.CaseId, request.LeadId);

        return await GetTimeEntryAsync(firmId, entry.Id);
    }

    public async Task<TimeEntryDto> UpdateTimeEntryAsync(Guid firmId, Guid userId, Guid id, UpdateTimeEntryRequest request)
    {
        var entry = await _db.TimeEntries.FirstOrDefaultAsync(e => e.Id == id && e.FirmId == firmId)
            ?? throw new KeyNotFoundException("Time entry not found");

        if (entry.Status == TimeEntryStatus.Billed)
            throw new InvalidOperationException("Cannot modify a billed time entry");

        entry.WorkDate = request.WorkDate;
        entry.DurationHours = request.DurationHours;
        entry.Description = request.Description;
        entry.ActivityCode = request.ActivityCode;
        entry.IsBillable = request.IsBillable;
        if (request.HourlyRateOverride.HasValue)
            entry.HourlyRate = request.HourlyRateOverride.Value;
        entry.UpdatedBy = userId.ToString();

        await _db.SaveChangesAsync();
        return await GetTimeEntryAsync(firmId, id);
    }

    public async Task DeleteTimeEntryAsync(Guid firmId, Guid userId, Guid id)
    {
        var entry = await _db.TimeEntries.FirstOrDefaultAsync(e => e.Id == id && e.FirmId == firmId)
            ?? throw new KeyNotFoundException("Time entry not found");

        if (entry.Status == TimeEntryStatus.Billed)
            throw new InvalidOperationException("Cannot delete a billed time entry");

        entry.IsDeleted = true;
        entry.UpdatedBy = userId.ToString();
        await _db.SaveChangesAsync();
    }

    public async Task<TimeEntryDto> GetTimeEntryAsync(Guid firmId, Guid id)
    {
        var e = await _db.TimeEntries
            .Include(t => t.User)
            .Include(t => t.Case)
            .Include(t => t.Lead)
            .FirstOrDefaultAsync(t => t.Id == id && t.FirmId == firmId)
            ?? throw new KeyNotFoundException("Time entry not found");

        return MapTimeEntry(e);
    }

    public async Task<PagedResponse<TimeEntryDto>> GetTimeEntriesAsync(Guid firmId, Guid? userId, Guid? caseId,
        TimeEntryStatus? status, DateTime? from, DateTime? to, bool? isBillable,
        int page = 1, int pageSize = 25)
    {
        var q = _db.TimeEntries
            .Where(t => t.FirmId == firmId)
            .Include(t => t.User)
            .Include(t => t.Case)
            .Include(t => t.Lead)
            .AsQueryable();

        if (userId.HasValue) q = q.Where(t => t.UserId == userId.Value);
        if (caseId.HasValue) q = q.Where(t => t.CaseId == caseId.Value);
        if (status.HasValue) q = q.Where(t => t.Status == status.Value);
        if (from.HasValue) q = q.Where(t => t.WorkDate >= from.Value);
        if (to.HasValue) q = q.Where(t => t.WorkDate <= to.Value);
        if (isBillable.HasValue) q = q.Where(t => t.IsBillable == isBillable.Value);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(t => t.WorkDate).ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        return new PagedResponse<TimeEntryDto>
        {
            Data = items.Select(MapTimeEntry).ToList(),
            Pagination = BuildPagination(page, pageSize, total)
        };
    }

    public async Task<TimeEntryDto> StartTimerAsync(Guid firmId, Guid userId, StartTimerRequest request)
    {
        // Check for already-running timer
        var running = await _db.TimeEntries
            .AnyAsync(t => t.FirmId == firmId && t.UserId == userId && t.TimerStart != null && t.TimerStop == null);
        if (running) throw new InvalidOperationException("A timer is already running. Stop it before starting a new one.");

        var rate = await ResolveHourlyRateAsync(firmId, userId, request.CaseId);

        var entry = new TimeEntry
        {
            FirmId = firmId,
            UserId = userId,
            CaseId = request.CaseId,
            LeadId = request.LeadId,
            WorkDate = DateTime.UtcNow.Date,
            DurationHours = 0,
            Description = request.Description ?? string.Empty,
            ActivityCode = request.ActivityCode,
            IsBillable = request.IsBillable,
            HourlyRate = rate,
            Currency = Currency.RON,
            Status = TimeEntryStatus.Draft,
            TimerStart = DateTime.UtcNow,
            CreatedBy = userId.ToString()
        };

        _db.TimeEntries.Add(entry);
        await _db.SaveChangesAsync();
        return await GetTimeEntryAsync(firmId, entry.Id);
    }

    public async Task<TimeEntryDto> StopTimerAsync(Guid firmId, Guid userId, Guid id, StopTimerRequest request)
    {
        var entry = await _db.TimeEntries.FirstOrDefaultAsync(t => t.Id == id && t.FirmId == firmId && t.UserId == userId)
            ?? throw new KeyNotFoundException("Time entry not found");

        if (entry.TimerStart == null || entry.TimerStop != null)
            throw new InvalidOperationException("Timer is not running");

        entry.TimerStop = DateTime.UtcNow;
        entry.DurationHours = Math.Round((decimal)(entry.TimerStop.Value - entry.TimerStart.Value).TotalHours, 2);
        if (!string.IsNullOrWhiteSpace(request.Description))
            entry.Description = request.Description;
        entry.UpdatedBy = userId.ToString();

        await _db.SaveChangesAsync();
        return await GetTimeEntryAsync(firmId, id);
    }

    public async Task ApproveTimeEntriesAsync(Guid firmId, Guid userId, List<Guid> ids)
    {
        var entries = await _db.TimeEntries
            .Where(t => t.FirmId == firmId && ids.Contains(t.Id) && t.Status == TimeEntryStatus.Draft)
            .ToListAsync();

        foreach (var e in entries)
        {
            e.Status = TimeEntryStatus.Approved;
            e.UpdatedBy = userId.ToString();
        }
        await _db.SaveChangesAsync();
        _logger.LogInformation("{Count} time entries approved by {UserId}", entries.Count, userId);
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  EXPENSES
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<ExpenseDto> CreateExpenseAsync(Guid firmId, Guid userId, CreateExpenseRequest request)
    {
        var exp = new Expense
        {
            FirmId = firmId,
            UserId = userId,
            CaseId = request.CaseId,
            ExpenseDate = request.ExpenseDate,
            Category = request.Category,
            Description = request.Description,
            Amount = request.Amount,
            Currency = request.Currency,
            MarkupPercent = request.MarkupPercent,
            IsBillable = request.IsBillable,
            ReceiptFilePath = request.ReceiptFilePath,
            Vendor = request.Vendor,
            Status = ExpenseStatus.Pending,
            CreatedBy = userId.ToString()
        };

        _db.Expenses.Add(exp);
        await _db.SaveChangesAsync();
        return await GetExpenseAsync(firmId, exp.Id);
    }

    public async Task<ExpenseDto> UpdateExpenseAsync(Guid firmId, Guid userId, Guid id, UpdateExpenseRequest request)
    {
        var exp = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.FirmId == firmId)
            ?? throw new KeyNotFoundException("Expense not found");

        if (exp.Status == ExpenseStatus.Billed)
            throw new InvalidOperationException("Cannot modify a billed expense");

        exp.ExpenseDate = request.ExpenseDate;
        exp.Category = request.Category;
        exp.Description = request.Description;
        exp.Amount = request.Amount;
        exp.MarkupPercent = request.MarkupPercent;
        exp.IsBillable = request.IsBillable;
        exp.ReceiptFilePath = request.ReceiptFilePath;
        exp.Vendor = request.Vendor;
        exp.UpdatedBy = userId.ToString();

        await _db.SaveChangesAsync();
        return await GetExpenseAsync(firmId, id);
    }

    public async Task DeleteExpenseAsync(Guid firmId, Guid userId, Guid id)
    {
        var exp = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.FirmId == firmId)
            ?? throw new KeyNotFoundException("Expense not found");

        if (exp.Status == ExpenseStatus.Billed)
            throw new InvalidOperationException("Cannot delete a billed expense");

        exp.IsDeleted = true;
        exp.UpdatedBy = userId.ToString();
        await _db.SaveChangesAsync();
    }

    public async Task<ExpenseDto> GetExpenseAsync(Guid firmId, Guid id)
    {
        var e = await _db.Expenses
            .Include(x => x.User).Include(x => x.Case)
            .FirstOrDefaultAsync(x => x.Id == id && x.FirmId == firmId)
            ?? throw new KeyNotFoundException("Expense not found");

        return MapExpense(e);
    }

    public async Task<PagedResponse<ExpenseDto>> GetExpensesAsync(Guid firmId, Guid? userId, Guid? caseId,
        ExpenseStatus? status, ExpenseCategory? category, DateTime? from, DateTime? to,
        int page = 1, int pageSize = 25)
    {
        var q = _db.Expenses.Where(e => e.FirmId == firmId)
            .Include(e => e.User).Include(e => e.Case).AsQueryable();

        if (userId.HasValue) q = q.Where(e => e.UserId == userId.Value);
        if (caseId.HasValue) q = q.Where(e => e.CaseId == caseId.Value);
        if (status.HasValue) q = q.Where(e => e.Status == status.Value);
        if (category.HasValue) q = q.Where(e => e.Category == category.Value);
        if (from.HasValue) q = q.Where(e => e.ExpenseDate >= from.Value);
        if (to.HasValue) q = q.Where(e => e.ExpenseDate <= to.Value);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(e => e.ExpenseDate).ThenByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResponse<ExpenseDto>
        {
            Data = items.Select(MapExpense).ToList(),
            Pagination = BuildPagination(page, pageSize, total)
        };
    }

    public async Task ApproveExpensesAsync(Guid firmId, Guid userId, List<Guid> ids)
    {
        var expenses = await _db.Expenses
            .Where(e => e.FirmId == firmId && ids.Contains(e.Id) && e.Status == ExpenseStatus.Pending)
            .ToListAsync();

        foreach (var e in expenses)
        {
            e.Status = ExpenseStatus.Approved;
            e.UpdatedBy = userId.ToString();
        }
        await _db.SaveChangesAsync();
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  INVOICES
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<InvoiceDto> CreateInvoiceAsync(Guid firmId, Guid userId, CreateInvoiceRequest request)
    {
        // Generate sequential invoice number
        var year = DateTime.UtcNow.Year;
        var count = await _db.Invoices.CountAsync(i => i.FirmId == firmId && i.InvoiceDate.Year == year);
        var invoiceNumber = $"LRO-{year}-{(count + 1):D5}";

        var invoice = new Invoice
        {
            FirmId = firmId,
            ClientId = request.ClientId,
            CaseId = request.CaseId,
            InvoiceNumber = invoiceNumber,
            InvoiceDate = DateTime.UtcNow,
            DueDate = request.DueDate,
            Currency = request.Currency,
            VatPercent = request.VatPercent,
            PeriodStart = request.PeriodStart,
            PeriodEnd = request.PeriodEnd,
            Notes = request.Notes,
            Status = InvoiceStatus.Draft,
            PaymentLinkToken = Guid.NewGuid().ToString("N"),
            CreatedBy = userId.ToString()
        };

        int lineNum = 0;

        // Add time entry line items
        if (request.TimeEntryIds?.Count > 0)
        {
            var timeEntries = await _db.TimeEntries
                .Where(t => t.FirmId == firmId && request.TimeEntryIds.Contains(t.Id)
                    && t.Status != TimeEntryStatus.Billed && t.IsBillable)
                .ToListAsync();

            foreach (var te in timeEntries)
            {
                lineNum++;
                var line = new InvoiceLineItem
                {
                    InvoiceId = invoice.Id,
                    LineNumber = lineNum,
                    Description = te.Description,
                    Quantity = te.DurationHours,
                    UnitPrice = te.HourlyRate,
                    Amount = te.DurationHours * te.HourlyRate,
                    LineType = "Time",
                    TimeEntryId = te.Id
                };
                invoice.LineItems.Add(line);
                te.Status = TimeEntryStatus.Billed;
                te.InvoiceLineItemId = line.Id;
            }
        }

        // Add expense line items
        if (request.ExpenseIds?.Count > 0)
        {
            var expenses = await _db.Expenses
                .Where(e => e.FirmId == firmId && request.ExpenseIds.Contains(e.Id)
                    && e.Status != ExpenseStatus.Billed && e.IsBillable)
                .ToListAsync();

            foreach (var exp in expenses)
            {
                lineNum++;
                var line = new InvoiceLineItem
                {
                    InvoiceId = invoice.Id,
                    LineNumber = lineNum,
                    Description = $"{exp.Category}: {exp.Description}",
                    Quantity = 1,
                    UnitPrice = exp.BillableAmount,
                    Amount = exp.BillableAmount,
                    LineType = "Expense",
                    ExpenseId = exp.Id
                };
                invoice.LineItems.Add(line);
                exp.Status = ExpenseStatus.Billed;
                exp.InvoiceLineItemId = line.Id;
            }
        }

        // Add manual line items
        if (request.ManualLineItems?.Count > 0)
        {
            foreach (var ml in request.ManualLineItems)
            {
                lineNum++;
                invoice.LineItems.Add(new InvoiceLineItem
                {
                    InvoiceId = invoice.Id,
                    LineNumber = lineNum,
                    Description = ml.Description,
                    Quantity = ml.Quantity,
                    UnitPrice = ml.UnitPrice,
                    Amount = ml.Quantity * ml.UnitPrice,
                    LineType = ml.LineType
                });
            }
        }

        // Calculate totals
        invoice.SubTotal = invoice.LineItems.Sum(l => l.Amount);
        invoice.VatAmount = Math.Round(invoice.SubTotal * invoice.VatPercent / 100m, 2);
        invoice.TotalAmount = invoice.SubTotal + invoice.VatAmount;

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Invoice {Number} created by {UserId} for client {ClientId}",
            invoiceNumber, userId, request.ClientId);

        return await GetInvoiceAsync(firmId, invoice.Id);
    }

    public async Task<InvoiceDto> GetInvoiceAsync(Guid firmId, Guid id)
    {
        var inv = await _db.Invoices
            .Include(i => i.Client)
            .Include(i => i.Case)
            .Include(i => i.LineItems.OrderBy(l => l.LineNumber))
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id && i.FirmId == firmId)
            ?? throw new KeyNotFoundException("Invoice not found");

        return MapInvoice(inv);
    }

    public async Task<PagedResponse<InvoiceListItemDto>> GetInvoicesAsync(Guid firmId, Guid? clientId, Guid? caseId,
        InvoiceStatus? status, DateTime? from, DateTime? to, int page = 1, int pageSize = 25)
    {
        var q = _db.Invoices.Where(i => i.FirmId == firmId)
            .Include(i => i.Client).Include(i => i.Case).AsQueryable();

        if (clientId.HasValue) q = q.Where(i => i.ClientId == clientId.Value);
        if (caseId.HasValue) q = q.Where(i => i.CaseId == caseId.Value);
        if (status.HasValue) q = q.Where(i => i.Status == status.Value);
        if (from.HasValue) q = q.Where(i => i.InvoiceDate >= from.Value);
        if (to.HasValue) q = q.Where(i => i.InvoiceDate <= to.Value);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(i => i.InvoiceDate)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(i => new InvoiceListItemDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                ClientName = i.Client.Name,
                CaseNumber = i.Case != null ? i.Case.CaseNumber : null,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                Status = i.Status,
                Currency = i.Currency,
                TotalAmount = i.TotalAmount,
                BalanceDue = i.TotalAmount - i.PaidAmount - i.WriteOffAmount
            })
            .ToListAsync();

        return new PagedResponse<InvoiceListItemDto>
        {
            Data = items,
            Pagination = BuildPagination(page, pageSize, total)
        };
    }

    public async Task<InvoiceDto> SendInvoiceAsync(Guid firmId, Guid userId, Guid id)
    {
        var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.Id == id && i.FirmId == firmId)
            ?? throw new KeyNotFoundException("Invoice not found");

        if (inv.Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Only draft invoices can be sent");

        inv.Status = InvoiceStatus.Sent;
        inv.SentAt = DateTime.UtcNow;
        inv.UpdatedBy = userId.ToString();
        await _db.SaveChangesAsync();

        _logger.LogInformation("Invoice {Number} sent by {UserId}", inv.InvoiceNumber, userId);
        return await GetInvoiceAsync(firmId, id);
    }

    public async Task<InvoiceDto> CancelInvoiceAsync(Guid firmId, Guid userId, Guid id)
    {
        var inv = await _db.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id && i.FirmId == firmId)
            ?? throw new KeyNotFoundException("Invoice not found");

        if (inv.PaidAmount > 0)
            throw new InvalidOperationException("Cannot cancel an invoice with payments. Issue a credit note instead.");

        inv.Status = InvoiceStatus.Cancelled;
        inv.UpdatedBy = userId.ToString();

        // Un-bill time entries and expenses
        var timeEntryIds = inv.LineItems.Where(l => l.TimeEntryId.HasValue).Select(l => l.TimeEntryId!.Value).ToList();
        var expenseIds = inv.LineItems.Where(l => l.ExpenseId.HasValue).Select(l => l.ExpenseId!.Value).ToList();

        if (timeEntryIds.Count > 0)
        {
            var entries = await _db.TimeEntries.Where(t => timeEntryIds.Contains(t.Id)).ToListAsync();
            foreach (var te in entries)
            {
                te.Status = TimeEntryStatus.Approved;
                te.InvoiceLineItemId = null;
            }
        }

        if (expenseIds.Count > 0)
        {
            var expenses = await _db.Expenses.Where(e => expenseIds.Contains(e.Id)).ToListAsync();
            foreach (var exp in expenses)
            {
                exp.Status = ExpenseStatus.Approved;
                exp.InvoiceLineItemId = null;
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Invoice {Number} cancelled by {UserId}", inv.InvoiceNumber, userId);
        return await GetInvoiceAsync(firmId, id);
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  PAYMENTS
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<PaymentDto> RecordPaymentAsync(Guid firmId, Guid userId, RecordPaymentRequest request)
    {
        var invoice = await _db.Invoices.FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.FirmId == firmId)
            ?? throw new KeyNotFoundException("Invoice not found");

        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new InvalidOperationException("Cannot record payment against a cancelled invoice");

        if (request.Amount > invoice.BalanceDue)
            throw new InvalidOperationException($"Payment amount {request.Amount} exceeds balance due {invoice.BalanceDue}");

        Guid? trustTxId = null;

        // If paying from trust account, create withdrawal
        if (request.TrustAccountId.HasValue)
        {
            var trust = await _db.TrustAccounts
                .FirstOrDefaultAsync(t => t.Id == request.TrustAccountId.Value && t.FirmId == firmId && t.IsActive)
                ?? throw new KeyNotFoundException("Trust account not found");

            if (trust.Balance < request.Amount)
                throw new InvalidOperationException("Insufficient trust account balance");

            trust.Balance -= request.Amount;

            var tx = new TrustTransaction
            {
                TrustAccountId = trust.Id,
                TransactionType = TrustTransactionType.Withdrawal,
                TransactionDate = request.PaymentDate,
                Amount = -request.Amount,
                RunningBalance = trust.Balance,
                Description = $"Payment for invoice {invoice.InvoiceNumber}",
                PerformedByUserId = userId,
                CreatedBy = userId.ToString()
            };
            _db.TrustTransactions.Add(tx);
            await _db.SaveChangesAsync(); // save to get tx.Id
            trustTxId = tx.Id;
        }

        var payment = new Payment
        {
            FirmId = firmId,
            InvoiceId = request.InvoiceId,
            ClientId = invoice.ClientId,
            PaymentDate = request.PaymentDate,
            Amount = request.Amount,
            Currency = request.Currency,
            Method = request.Method,
            TransactionReference = request.TransactionReference,
            Notes = request.Notes,
            TrustTransactionId = trustTxId,
            CreatedBy = userId.ToString()
        };

        _db.Payments.Add(payment);

        // Update invoice paid amount and status
        invoice.PaidAmount += request.Amount;
        if (invoice.BalanceDue <= 0)
            invoice.Status = InvoiceStatus.Paid;
        else if (invoice.PaidAmount > 0)
            invoice.Status = InvoiceStatus.PartiallyPaid;
        invoice.UpdatedBy = userId.ToString();

        await _db.SaveChangesAsync();
        _logger.LogInformation("Payment {Id} of {Amount} recorded for invoice {Number} by {UserId}",
            payment.Id, request.Amount, invoice.InvoiceNumber, userId);

        return MapPayment(payment, invoice.InvoiceNumber, invoice.Client?.Name);
    }

    public async Task<PagedResponse<PaymentDto>> GetPaymentsAsync(Guid firmId, Guid? clientId, Guid? invoiceId,
        DateTime? from, DateTime? to, int page = 1, int pageSize = 25)
    {
        var q = _db.Payments.Where(p => p.FirmId == firmId)
            .Include(p => p.Invoice).Include(p => p.Client).AsQueryable();

        if (clientId.HasValue) q = q.Where(p => p.ClientId == clientId.Value);
        if (invoiceId.HasValue) q = q.Where(p => p.InvoiceId == invoiceId.Value);
        if (from.HasValue) q = q.Where(p => p.PaymentDate >= from.Value);
        if (to.HasValue) q = q.Where(p => p.PaymentDate <= to.Value);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.PaymentDate)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResponse<PaymentDto>
        {
            Data = items.Select(p => MapPayment(p, p.Invoice?.InvoiceNumber, p.Client?.Name)).ToList(),
            Pagination = BuildPagination(page, pageSize, total)
        };
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  TRUST ACCOUNTS
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<TrustAccountDto> CreateTrustAccountAsync(Guid firmId, Guid userId, CreateTrustAccountRequest request)
    {
        var clientName = await _db.Clients
            .Where(c => c.Id == request.ClientId && c.FirmId == firmId)
            .Select(c => c.Name).FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Client not found");

        var count = await _db.TrustAccounts.CountAsync(t => t.FirmId == firmId);
        var account = new TrustAccount
        {
            FirmId = firmId,
            ClientId = request.ClientId,
            AccountReference = $"TA-{clientName.Split(' ').First().ToUpperInvariant()}-{(count + 1):D3}",
            Currency = request.Currency,
            Balance = 0,
            MinimumBalance = request.MinimumBalance,
            Notes = request.Notes,
            CreatedBy = userId.ToString()
        };

        _db.TrustAccounts.Add(account);
        await _db.SaveChangesAsync();
        return await GetTrustAccountAsync(firmId, account.Id);
    }

    public async Task<TrustAccountDto> GetTrustAccountAsync(Guid firmId, Guid id)
    {
        var a = await _db.TrustAccounts.Include(t => t.Client)
            .FirstOrDefaultAsync(t => t.Id == id && t.FirmId == firmId)
            ?? throw new KeyNotFoundException("Trust account not found");

        return MapTrustAccount(a);
    }

    public async Task<List<TrustAccountDto>> GetTrustAccountsAsync(Guid firmId, Guid? clientId)
    {
        var q = _db.TrustAccounts.Where(t => t.FirmId == firmId).Include(t => t.Client).AsQueryable();
        if (clientId.HasValue) q = q.Where(t => t.ClientId == clientId.Value);

        return (await q.OrderBy(t => t.AccountReference).ToListAsync())
            .Select(MapTrustAccount).ToList();
    }

    public async Task<TrustTransactionDto> CreateTrustTransactionAsync(Guid firmId, Guid userId, CreateTrustTransactionRequest request)
    {
        var account = await _db.TrustAccounts
            .FirstOrDefaultAsync(t => t.Id == request.TrustAccountId && t.FirmId == firmId && t.IsActive)
            ?? throw new KeyNotFoundException("Trust account not found or inactive");

        var signedAmount = request.TransactionType switch
        {
            TrustTransactionType.Deposit or TrustTransactionType.InterestCredit => request.Amount,
            TrustTransactionType.Withdrawal or TrustTransactionType.BankFee or TrustTransactionType.RefundToClient => -request.Amount,
            TrustTransactionType.Transfer => -request.Amount, // outgoing
            _ => request.Amount
        };

        if (account.Balance + signedAmount < 0)
            throw new InvalidOperationException("Insufficient trust account balance");

        account.Balance += signedAmount;

        var tx = new TrustTransaction
        {
            TrustAccountId = account.Id,
            TransactionType = request.TransactionType,
            TransactionDate = request.TransactionDate,
            Amount = signedAmount,
            RunningBalance = account.Balance,
            Description = request.Description,
            Reference = request.Reference,
            PerformedByUserId = userId,
            CreatedBy = userId.ToString()
        };

        _db.TrustTransactions.Add(tx);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Trust transaction {Type} of {Amount} on account {Ref} by {UserId}",
            request.TransactionType, request.Amount, account.AccountReference, userId);

        return MapTrustTransaction(tx, null);
    }

    public async Task<PagedResponse<TrustTransactionDto>> GetTrustTransactionsAsync(Guid firmId, Guid trustAccountId,
        int page = 1, int pageSize = 25)
    {
        // Verify account belongs to firm
        var exists = await _db.TrustAccounts.AnyAsync(t => t.Id == trustAccountId && t.FirmId == firmId);
        if (!exists) throw new KeyNotFoundException("Trust account not found");

        var q = _db.TrustTransactions
            .Where(t => t.TrustAccountId == trustAccountId)
            .Include(t => t.PerformedByUser);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(t => t.TransactionDate).ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResponse<TrustTransactionDto>
        {
            Data = items.Select(t => MapTrustTransaction(t, t.PerformedByUser?.FullName)).ToList(),
            Pagination = BuildPagination(page, pageSize, total)
        };
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  BILLING RATES
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<BillingRateDto> CreateBillingRateAsync(Guid firmId, Guid userId, CreateBillingRateRequest request)
    {
        var rate = new BillingRate
        {
            FirmId = firmId,
            UserId = request.UserId,
            ClientId = request.ClientId,
            CaseId = request.CaseId,
            Rate = request.Rate,
            Currency = request.Currency,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            Description = request.Description,
            CreatedBy = userId.ToString()
        };

        _db.BillingRates.Add(rate);
        await _db.SaveChangesAsync();

        return (await GetBillingRatesAsync(firmId, rate.UserId, rate.ClientId, rate.CaseId)).First(r => r.Id == rate.Id);
    }

    public async Task<List<BillingRateDto>> GetBillingRatesAsync(Guid firmId, Guid? userId, Guid? clientId, Guid? caseId)
    {
        var q = _db.BillingRates.Where(r => r.FirmId == firmId)
            .Include(r => r.User).Include(r => r.Client).Include(r => r.Case).AsQueryable();

        if (userId.HasValue) q = q.Where(r => r.UserId == userId.Value);
        if (clientId.HasValue) q = q.Where(r => r.ClientId == clientId.Value);
        if (caseId.HasValue) q = q.Where(r => r.CaseId == caseId.Value);

        return (await q.OrderByDescending(r => r.EffectiveFrom).ToListAsync())
            .Select(r => new BillingRateDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserFullName = r.User?.FullName,
                ClientId = r.ClientId,
                ClientName = r.Client?.Name,
                CaseId = r.CaseId,
                CaseNumber = r.Case?.CaseNumber,
                Rate = r.Rate,
                Currency = r.Currency,
                EffectiveFrom = r.EffectiveFrom,
                EffectiveTo = r.EffectiveTo,
                Description = r.Description
            }).ToList();
    }

    public async Task DeleteBillingRateAsync(Guid firmId, Guid id)
    {
        var rate = await _db.BillingRates.FirstOrDefaultAsync(r => r.Id == id && r.FirmId == firmId)
            ?? throw new KeyNotFoundException("Billing rate not found");
        rate.IsDeleted = true;
        await _db.SaveChangesAsync();
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  REPORTING
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<BillingSummaryDto> GetBillingSummaryAsync(Guid firmId, DateTime? from, DateTime? to)
    {
        var fromDate = from ?? DateTime.UtcNow.AddMonths(-12);
        var toDate = to ?? DateTime.UtcNow;

        var wip = await _db.TimeEntries
            .Where(t => t.FirmId == firmId && t.IsBillable
                && t.Status != TimeEntryStatus.Billed && t.Status != TimeEntryStatus.WrittenOff
                && t.WorkDate >= fromDate && t.WorkDate <= toDate)
            .SumAsync(t => t.DurationHours * t.HourlyRate);

        var billed = await _db.Invoices
            .Where(i => i.FirmId == firmId && i.Status != InvoiceStatus.Cancelled
                && i.InvoiceDate >= fromDate && i.InvoiceDate <= toDate)
            .SumAsync(i => i.TotalAmount);

        var collected = await _db.Payments
            .Where(p => p.FirmId == firmId && p.PaymentDate >= fromDate && p.PaymentDate <= toDate)
            .SumAsync(p => p.Amount);

        var outstanding = await _db.Invoices
            .Where(i => i.FirmId == firmId
                && i.Status != InvoiceStatus.Cancelled && i.Status != InvoiceStatus.Paid)
            .SumAsync(i => i.TotalAmount - i.PaidAmount - i.WriteOffAmount);

        var overdue = await _db.Invoices
            .CountAsync(i => i.FirmId == firmId
                && i.Status != InvoiceStatus.Cancelled && i.Status != InvoiceStatus.Paid
                && i.DueDate < DateTime.UtcNow);

        var trustBalance = await _db.TrustAccounts
            .Where(t => t.FirmId == firmId && t.IsActive)
            .SumAsync(t => t.Balance);

        var totalBillableValue = wip + billed;

        return new BillingSummaryDto
        {
            TotalWip = wip,
            TotalBilled = billed,
            TotalCollected = collected,
            TotalOutstanding = outstanding,
            RealizationRate = totalBillableValue > 0 ? Math.Round(billed / totalBillableValue * 100, 1) : 0,
            CollectionRate = billed > 0 ? Math.Round(collected / billed * 100, 1) : 0,
            OverdueInvoiceCount = overdue,
            TrustAccountsBalance = trustBalance
        };
    }

    public async Task<List<LawyerProductivityDto>> GetLawyerProductivityAsync(Guid firmId, DateTime from, DateTime to)
    {
        var entries = await _db.TimeEntries
            .Where(t => t.FirmId == firmId && t.WorkDate >= from && t.WorkDate <= to)
            .Include(t => t.User)
            .GroupBy(t => new { t.UserId, t.User.FirstName, t.User.LastName })
            .Select(g => new LawyerProductivityDto
            {
                UserId = g.Key.UserId,
                FullName = g.Key.FirstName + " " + g.Key.LastName,
                TotalHours = g.Sum(t => t.DurationHours),
                BillableHours = g.Where(t => t.IsBillable).Sum(t => t.DurationHours),
                NonBillableHours = g.Where(t => !t.IsBillable).Sum(t => t.DurationHours),
                BilledAmount = g.Where(t => t.Status == TimeEntryStatus.Billed && t.IsBillable)
                                .Sum(t => t.DurationHours * t.HourlyRate)
            })
            .ToListAsync();

        // Business days in period (approx.)
        var businessDays = (decimal)Math.Max(1,
            Enumerable.Range(0, (to - from).Days + 1)
                .Count(d => ((int)from.AddDays(d).DayOfWeek) is >= 1 and <= 5));
        var targetHours = businessDays * 8;

        // Compute collected amounts per lawyer by attributing each payment
        // proportionally across the time-entry owners on its invoice.
        var collectedByUser = new Dictionary<Guid, decimal>();

        var paidInvoiceIds = await _db.Payments
            .Where(p => p.FirmId == firmId && p.PaymentDate >= from && p.PaymentDate <= to)
            .Select(p => p.InvoiceId)
            .Distinct()
            .ToListAsync();

        if (paidInvoiceIds.Count > 0)
        {
            // For each paid invoice, find each lawyer's share of the line items
            var lawyerShares = await _db.InvoiceLineItems
                .Where(li => paidInvoiceIds.Contains(li.InvoiceId)
                    && li.TimeEntryId != null)
                .Join(_db.TimeEntries, li => li.TimeEntryId, te => te.Id,
                    (li, te) => new { li.InvoiceId, te.UserId, li.Amount })
                .GroupBy(x => new { x.InvoiceId, x.UserId })
                .Select(g => new { g.Key.InvoiceId, g.Key.UserId, Total = g.Sum(x => x.Amount) })
                .ToListAsync();

            var invoiceTotals = lawyerShares
                .GroupBy(x => x.InvoiceId)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.Total));

            var paymentsByInvoice = await _db.Payments
                .Where(p => p.FirmId == firmId && p.PaymentDate >= from && p.PaymentDate <= to)
                .GroupBy(p => p.InvoiceId)
                .Select(g => new { InvoiceId = g.Key, Paid = g.Sum(p => p.Amount) })
                .ToListAsync();

            foreach (var pi in paymentsByInvoice)
            {
                if (!invoiceTotals.TryGetValue(pi.InvoiceId, out var invTotal) || invTotal == 0)
                    continue;

                var shares = lawyerShares.Where(s => s.InvoiceId == pi.InvoiceId);
                foreach (var share in shares)
                {
                    var portion = pi.Paid * (share.Total / invTotal);
                    if (!collectedByUser.ContainsKey(share.UserId))
                        collectedByUser[share.UserId] = 0;
                    collectedByUser[share.UserId] += portion;
                }
            }
        }

        foreach (var e in entries)
        {
            e.UtilizationRate = targetHours > 0 ? Math.Round(e.BillableHours / targetHours * 100, 1) : 0;
            if (collectedByUser.TryGetValue(e.UserId, out var collected))
                e.CollectedAmount = Math.Round(collected, 2);
        }

        return entries.OrderByDescending(e => e.BillableHours).ToList();
    }

    public async Task<ArAgingDto> GetArAgingAsync(Guid firmId)
    {
        var now = DateTime.UtcNow;
        var invoices = await _db.Invoices
            .Where(i => i.FirmId == firmId
                && i.Status != InvoiceStatus.Cancelled && i.Status != InvoiceStatus.Paid
                && i.Status != InvoiceStatus.Draft)
            .Select(i => new { i.DueDate, Balance = i.TotalAmount - i.PaidAmount - i.WriteOffAmount })
            .ToListAsync();

        return new ArAgingDto
        {
            Current = invoices.Where(i => (now - i.DueDate).TotalDays <= 30).Sum(i => i.Balance),
            ThirtyDays = invoices.Where(i => (now - i.DueDate).TotalDays > 30 && (now - i.DueDate).TotalDays <= 60).Sum(i => i.Balance),
            SixtyDays = invoices.Where(i => (now - i.DueDate).TotalDays > 60 && (now - i.DueDate).TotalDays <= 90).Sum(i => i.Balance),
            NinetyPlusDays = invoices.Where(i => (now - i.DueDate).TotalDays > 90).Sum(i => i.Balance),
            Total = invoices.Sum(i => i.Balance)
        };
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  PRIVATE HELPERS
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    private async Task<decimal> ResolveHourlyRateAsync(Guid firmId, Guid userId, Guid? caseId)
    {
        // Priority: case-specific > client-specific > user-specific > firm default
        var now = DateTime.UtcNow;
        var rates = await _db.BillingRates
            .Where(r => r.FirmId == firmId
                && r.EffectiveFrom <= now
                && (r.EffectiveTo == null || r.EffectiveTo >= now))
            .OrderByDescending(r => r.CaseId.HasValue ? 3 : r.ClientId.HasValue ? 2 : r.UserId.HasValue ? 1 : 0)
            .ToListAsync();

        if (caseId.HasValue)
        {
            var caseRate = rates.FirstOrDefault(r => r.CaseId == caseId && r.UserId == userId);
            if (caseRate != null) return caseRate.Rate;
        }

        var userRate = rates.FirstOrDefault(r => r.UserId == userId && r.CaseId == null && r.ClientId == null);
        if (userRate != null) return userRate.Rate;

        var firmDefault = rates.FirstOrDefault(r => r.UserId == null && r.CaseId == null && r.ClientId == null);
        return firmDefault?.Rate ?? 300m; // fallback default 300 RON/hr
    }

    private static TimeEntryDto MapTimeEntry(TimeEntry e) => new()
    {
        Id = e.Id,
        CaseId = e.CaseId,
        CaseNumber = e.Case?.CaseNumber,
        CaseTitle = e.Case?.Title,
        LeadId = e.LeadId,
        LeadName = e.Lead?.Name,
        UserId = e.UserId,
        UserFullName = e.User?.FullName,
        WorkDate = e.WorkDate,
        DurationHours = e.DurationHours,
        Description = e.Description,
        ActivityCode = e.ActivityCode,
        IsBillable = e.IsBillable,
        HourlyRate = e.HourlyRate,
        Currency = e.Currency,
        TotalAmount = e.TotalAmount,
        Status = e.Status,
        TimerStart = e.TimerStart,
        TimerStop = e.TimerStop,
        CreatedAt = e.CreatedAt
    };

    private static ExpenseDto MapExpense(Expense e) => new()
    {
        Id = e.Id,
        CaseId = e.CaseId,
        CaseNumber = e.Case?.CaseNumber,
        CaseTitle = e.Case?.Title,
        UserId = e.UserId,
        UserFullName = e.User?.FullName,
        ExpenseDate = e.ExpenseDate,
        Category = e.Category,
        Description = e.Description,
        Amount = e.Amount,
        Currency = e.Currency,
        MarkupPercent = e.BillableAmount,
        BillableAmount = e.BillableAmount,
        IsBillable = e.IsBillable,
        Status = e.Status,
        ReceiptFilePath = e.ReceiptFilePath,
        Vendor = e.Vendor,
        CreatedAt = e.CreatedAt
    };

    private static InvoiceDto MapInvoice(Invoice inv) => new()
    {
        Id = inv.Id,
        InvoiceNumber = inv.InvoiceNumber,
        ClientId = inv.ClientId,
        ClientName = inv.Client?.Name,
        CaseId = inv.CaseId,
        CaseNumber = inv.Case?.CaseNumber,
        InvoiceDate = inv.InvoiceDate,
        DueDate = inv.DueDate,
        Status = inv.Status,
        Currency = inv.Currency,
        SubTotal = inv.SubTotal,
        VatPercent = inv.VatPercent,
        VatAmount = inv.VatAmount,
        TotalAmount = inv.TotalAmount,
        PaidAmount = inv.PaidAmount,
        WriteOffAmount = inv.WriteOffAmount,
        BalanceDue = inv.BalanceDue,
        PeriodStart = inv.PeriodStart,
        PeriodEnd = inv.PeriodEnd,
        Notes = inv.Notes,
        EFacturaId = inv.EFacturaId,
        SentAt = inv.SentAt,
        LineItems = inv.LineItems.Select(l => new InvoiceLineItemDto
        {
            Id = l.Id,
            LineNumber = l.LineNumber,
            Description = l.Description,
            Quantity = l.Quantity,
            UnitPrice = l.UnitPrice,
            Amount = l.Amount,
            LineType = l.LineType,
            TimeEntryId = l.TimeEntryId,
            ExpenseId = l.ExpenseId
        }).ToList(),
        Payments = inv.Payments.Select(p => new PaymentSummaryDto
        {
            Id = p.Id,
            PaymentDate = p.PaymentDate,
            Amount = p.Amount,
            Method = p.Method
        }).ToList(),
        CreatedAt = inv.CreatedAt
    };

    private static PaymentDto MapPayment(Payment p, string? invoiceNumber, string? clientName) => new()
    {
        Id = p.Id,
        InvoiceId = p.InvoiceId,
        InvoiceNumber = invoiceNumber,
        ClientId = p.ClientId,
        ClientName = clientName,
        PaymentDate = p.PaymentDate,
        Amount = p.Amount,
        Currency = p.Currency,
        Method = p.Method,
        TransactionReference = p.TransactionReference,
        Notes = p.Notes,
        CreatedAt = p.CreatedAt
    };

    private static TrustAccountDto MapTrustAccount(TrustAccount a) => new()
    {
        Id = a.Id,
        ClientId = a.ClientId,
        ClientName = a.Client?.Name,
        AccountReference = a.AccountReference,
        Currency = a.Currency,
        Balance = a.Balance,
        MinimumBalance = a.MinimumBalance,
        IsActive = a.IsActive,
        Notes = a.Notes,
        CreatedAt = a.CreatedAt
    };

    private static TrustTransactionDto MapTrustTransaction(TrustTransaction t, string? performedByName) => new()
    {
        Id = t.Id,
        TrustAccountId = t.TrustAccountId,
        TransactionType = t.TransactionType,
        TransactionDate = t.TransactionDate,
        Amount = t.Amount,
        RunningBalance = t.RunningBalance,
        Description = t.Description,
        Reference = t.Reference,
        PerformedByName = performedByName,
        CreatedAt = t.CreatedAt
    };

    private static PaginationMetadata BuildPagination(int page, int pageSize, int total) => new()
    {
        Page = page,
        PageSize = pageSize,
        TotalCount = total,
        TotalPages = (int)Math.Ceiling(total / (double)pageSize)
    };
}
