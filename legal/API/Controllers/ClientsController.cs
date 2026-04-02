using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegalRO.CaseManagement.API.Controllers;

[ApiController]
[Route("api/v1/clients")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClientListItem>>> GetClients()
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var clients = await _context.Clients
            .Where(c => c.FirmId == firmId)
            .OrderBy(c => c.Name)
            .Select(c => new ClientListItem
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                Phone = c.Phone,
                IsCorporate = c.IsCorporate,
                FiscalCode = c.FiscalCode
            })
            .ToListAsync();

        return Ok(clients);
    }
}

public class ClientListItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsCorporate { get; set; }
    public string? FiscalCode { get; set; }
}
