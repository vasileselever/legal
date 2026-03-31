using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Billing;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/billing/time-entries")]
[Authorize]
public class TimeEntriesController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly ILogger<TimeEntriesController> _logger;

    public TimeEntriesController(IBillingService billing, ILogger<TimeEntriesController> logger)
    {
        _billing = billing;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<TimeEntryDto>>> GetTimeEntries(
        [FromQuery] Guid? userId,
        [FromQuery] Guid? caseId,
        [FromQuery] TimeEntryStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] bool? isBillable,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var result = await _billing.GetTimeEntriesAsync(firmId, userId, caseId, status, from, to, isBillable, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TimeEntryDto>> GetTimeEntry(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        try { return Ok(await _billing.GetTimeEntryAsync(firmId, id)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Time entry not found" }); }
    }

    [HttpPost]
    public async Task<ActionResult<TimeEntryDto>> CreateTimeEntry([FromBody] CreateTimeEntryRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try
        {
            var result = await _billing.CreateTimeEntryAsync(firmId, userId, request);
            return CreatedAtAction(nameof(GetTimeEntry), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating time entry for firm {FirmId}, user {UserId}", firmId, userId);
            return StatusCode(500, new ApiError { Code = "CREATE_FAILED", Message = "Eroare la crearea pontajului. Verificati datele si incercati din nou." });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TimeEntryDto>> UpdateTimeEntry(Guid id, [FromBody] UpdateTimeEntryRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try { return Ok(await _billing.UpdateTimeEntryAsync(firmId, userId, id, request)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Time entry not found" }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTimeEntry(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try { await _billing.DeleteTimeEntryAsync(firmId, userId, id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Time entry not found" }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }

    [HttpPost("start-timer")]
    public async Task<ActionResult<TimeEntryDto>> StartTimer([FromBody] StartTimerRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try { return Ok(await _billing.StartTimerAsync(firmId, userId, request)); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "TIMER_RUNNING", Message = ex.Message }); }
    }

    [HttpPost("{id}/stop-timer")]
    public async Task<ActionResult<TimeEntryDto>> StopTimer(Guid id, [FromBody] StopTimerRequest request)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        try { return Ok(await _billing.StopTimerAsync(firmId, userId, id, request)); }
        catch (KeyNotFoundException) { return NotFound(new ApiError { Code = "NOT_FOUND", Message = "Time entry not found" }); }
        catch (InvalidOperationException ex) { return BadRequest(new ApiError { Code = "INVALID_OP", Message = ex.Message }); }
    }

    [HttpPost("approve")]
    public async Task<ActionResult> ApproveTimeEntries([FromBody] List<Guid> ids)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var userId = ClaimsHelper.GetUserId(User);
        await _billing.ApproveTimeEntriesAsync(firmId, userId, ids);
        return Ok(new { message = $"{ids.Count} time entries approved" });
    }
}
