using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/billing/reports")]
[Authorize]
public class BillingReportsController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly ILogger<BillingReportsController> _logger;

    public BillingReportsController(IBillingService billing, ILogger<BillingReportsController> logger)
    {
        _billing = billing;
        _logger = logger;
    }

    /// <summary>
    /// Get firm-wide billing summary (WIP, billed, collected, outstanding, etc.)
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<BillingSummaryDto>> GetBillingSummary(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        return Ok(await _billing.GetBillingSummaryAsync(firmId, from, to));
    }

    /// <summary>
    /// Get lawyer productivity / utilization report
    /// </summary>
    [HttpGet("lawyer-productivity")]
    public async Task<ActionResult<List<LawyerProductivityDto>>> GetLawyerProductivity(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var fromDate = from ?? DateTime.UtcNow.AddMonths(-1);
        var toDate = to ?? DateTime.UtcNow;
        return Ok(await _billing.GetLawyerProductivityAsync(firmId, fromDate, toDate));
    }

    /// <summary>
    /// Get accounts receivable aging report
    /// </summary>
    [HttpGet("ar-aging")]
    public async Task<ActionResult<ArAgingDto>> GetArAging()
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        return Ok(await _billing.GetArAgingAsync(firmId));
    }
}
