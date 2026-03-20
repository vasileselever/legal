using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/billing/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IBillingService billing, ILogger<PaymentsController> logger)
    {
        _billing = billing;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<PaymentDto>>> GetPayments(
        [FromQuery] Guid? clientId,
        [FromQuery] Guid? invoiceId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        return Ok(await _billing.GetPaymentsAsync(firmId, clientId, invoiceId, from, to, page, pageSize));
    }

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> RecordPayment([FromBody] RecordPaymentRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try
        {
            var result = await _billing.RecordPaymentAsync(firmId, userId, request);
            return CreatedAtAction(nameof(GetPayments), result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }
}
