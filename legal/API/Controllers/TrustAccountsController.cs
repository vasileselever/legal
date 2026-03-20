using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/billing/trust-accounts")]
[Authorize]
public class TrustAccountsController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly ILogger<TrustAccountsController> _logger;

    public TrustAccountsController(IBillingService billing, ILogger<TrustAccountsController> logger)
    {
        _billing = billing;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<TrustAccountDto>>> GetTrustAccounts([FromQuery] Guid? clientId)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        return Ok(await _billing.GetTrustAccountsAsync(firmId, clientId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TrustAccountDto>> GetTrustAccount(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        try { return Ok(await _billing.GetTrustAccountAsync(firmId, id)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Trust account not found" }); }
    }

    [HttpPost]
    public async Task<ActionResult<TrustAccountDto>> CreateTrustAccount([FromBody] CreateTrustAccountRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try
        {
            var result = await _billing.CreateTrustAccountAsync(firmId, userId, request);
            return CreatedAtAction(nameof(GetTrustAccount), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = ex.Message }); }
    }

    [HttpGet("{id}/transactions")]
    public async Task<ActionResult<PagedResponse<TrustTransactionDto>>> GetTransactions(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        try { return Ok(await _billing.GetTrustTransactionsAsync(firmId, id, page, pageSize)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Trust account not found" }); }
    }

    [HttpPost("transactions")]
    public async Task<ActionResult<TrustTransactionDto>> CreateTransaction([FromBody] CreateTrustTransactionRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try { return Ok(await _billing.CreateTrustTransactionAsync(firmId, userId, request)); }
        catch (KeyNotFoundException ex) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }
}
