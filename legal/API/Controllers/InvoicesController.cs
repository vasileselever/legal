using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/billing/invoices")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(IBillingService billing, ILogger<InvoicesController> logger)
    {
        _billing = billing;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<InvoiceListItemDto>>> GetInvoices(
        [FromQuery] Guid? clientId,
        [FromQuery] Guid? caseId,
        [FromQuery] InvoiceStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        return Ok(await _billing.GetInvoicesAsync(firmId, clientId, caseId, status, from, to, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        try { return Ok(await _billing.GetInvoiceAsync(firmId, id)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Invoice not found" }); }
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice([FromBody] CreateInvoiceRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try
        {
            var result = await _billing.CreateInvoiceAsync(firmId, userId, request);
            return CreatedAtAction(nameof(GetInvoice), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = ex.Message }); }
    }

    [HttpPost("{id}/send")]
    public async Task<ActionResult<InvoiceDto>> SendInvoice(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try { return Ok(await _billing.SendInvoiceAsync(firmId, userId, id)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Invoice not found" }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<InvoiceDto>> CancelInvoice(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try { return Ok(await _billing.CancelInvoiceAsync(firmId, userId, id)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Invoice not found" }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }
}
