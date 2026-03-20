using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/billing/rates")]
[Authorize]
public class BillingRatesController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly ILogger<BillingRatesController> _logger;

    public BillingRatesController(IBillingService billing, ILogger<BillingRatesController> logger)
    {
        _billing = billing;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<BillingRateDto>>> GetBillingRates(
        [FromQuery] Guid? userId,
        [FromQuery] Guid? clientId,
        [FromQuery] Guid? caseId)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        return Ok(await _billing.GetBillingRatesAsync(firmId, userId, clientId, caseId));
    }

    [HttpPost]
    public async Task<ActionResult<BillingRateDto>> CreateBillingRate([FromBody] CreateBillingRateRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        var result = await _billing.CreateBillingRateAsync(firmId, userId, request);
        return CreatedAtAction(nameof(GetBillingRates), result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBillingRate(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        try { await _billing.DeleteBillingRateAsync(firmId, id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Billing rate not found" }); }
    }
}
