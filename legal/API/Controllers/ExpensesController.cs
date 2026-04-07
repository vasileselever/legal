using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/billing/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(IBillingService billing, UserManager<User> userManager, ILogger<ExpensesController> logger)
    {
        _billing = billing;
        _userManager = userManager;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<ExpenseDto>>> GetExpenses(
        [FromQuery] Guid? userId,
        [FromQuery] Guid? caseId,
        [FromQuery] ExpenseStatus? status,
        [FromQuery] ExpenseCategory? category,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        return Ok(await _billing.GetExpensesAsync(firmId, userId, caseId, status, category, from, to, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        try { return Ok(await _billing.GetExpenseAsync(firmId, id)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Expense not found" }); }
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        var result = await _billing.CreateExpenseAsync(firmId, userId, request);
        return CreatedAtAction(nameof(GetExpense), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(Guid id, [FromBody] UpdateExpenseRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);

        // Only admin can change expense status
        if (request.Status.HasValue)
        {
            var caller = await _userManager.FindByIdAsync(userId.ToString());
            if (caller == null || caller.Role != UserRole.Admin)
                return StatusCode(403, new ApiError { Code = "FORBIDDEN", Message = "Doar administratorul poate modifica statusul cheltuielilor." });
        }

        try { return Ok(await _billing.UpdateExpenseAsync(firmId, userId, id, request)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Expense not found" }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteExpense(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try { await _billing.DeleteExpenseAsync(firmId, userId, id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Expense not found" }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }

    [HttpPost("approve")]
    public async Task<ActionResult> ApproveExpenses([FromBody] List<Guid> ids)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        var caller = await _userManager.FindByIdAsync(userId.ToString());
        if (caller == null || caller.Role != UserRole.Admin)
            return StatusCode(403, new { message = "Doar administratorul poate aproba cheltuielile." });
        await _billing.ApproveExpensesAsync(firmId, userId, ids);
        return Ok(new { message = $"{ids.Count} expenses approved" });
    }
}
