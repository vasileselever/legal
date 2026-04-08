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
                FiscalCode = c.FiscalCode,
                RegistrationCode = c.RegistrationCode,
                Address = c.Address,
                City = c.City,
                Bank = c.Bank,
                BankAccount = c.BankAccount,
                AssignedLawyerId = _context.Leads
                    .Where(l => l.ConvertedToClientId == c.Id && l.AssignedTo != null)
                    .Select(l => (Guid?)l.AssignedTo)
                    .FirstOrDefault(),
                AssignedLawyerName = _context.Leads
                    .Where(l => l.ConvertedToClientId == c.Id && l.AssignedTo != null)
                    .Select(l => l.AssignedLawyer != null
                        ? l.AssignedLawyer.FirstName + " " + l.AssignedLawyer.LastName
                        : null)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(clients);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClientListItem>> GetClient(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var c = await _context.Clients.FirstOrDefaultAsync(x => x.Id == id && x.FirmId == firmId);
        if (c == null) return NotFound();
        return Ok(new ClientListItem
        {
            Id = c.Id, Name = c.Name, Email = c.Email, Phone = c.Phone,
            IsCorporate = c.IsCorporate, FiscalCode = c.FiscalCode,
            RegistrationCode = c.RegistrationCode, Address = c.Address,
            City = c.City, Bank = c.Bank, BankAccount = c.BankAccount,
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClient(Guid id, [FromBody] UpdateClientDto dto)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var c = await _context.Clients.FirstOrDefaultAsync(x => x.Id == id && x.FirmId == firmId);
        if (c == null) return NotFound();

        c.Name             = dto.Name?.Trim() ?? c.Name;
        c.Email            = dto.Email?.Trim() ?? c.Email;
        c.Phone            = dto.Phone?.Trim() ?? c.Phone;
        c.IsCorporate      = dto.IsCorporate;
        c.Address          = dto.Address?.Trim();
        c.City             = dto.City?.Trim();
        c.FiscalCode       = dto.FiscalCode?.Trim();
        c.RegistrationCode = dto.RegistrationCode?.Trim();
        c.Bank             = dto.Bank?.Trim();
        c.BankAccount      = dto.BankAccount?.Trim();

        await _context.SaveChangesAsync();
        return Ok(new ClientListItem
        {
            Id = c.Id, Name = c.Name, Email = c.Email, Phone = c.Phone,
            IsCorporate = c.IsCorporate, FiscalCode = c.FiscalCode,
            RegistrationCode = c.RegistrationCode, Address = c.Address,
            City = c.City, Bank = c.Bank, BankAccount = c.BankAccount,
        });
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
    public string? RegistrationCode { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Bank { get; set; }
    public string? BankAccount { get; set; }
    public Guid? AssignedLawyerId { get; set; }
    public string? AssignedLawyerName { get; set; }
}

public class UpdateClientDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsCorporate { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? FiscalCode { get; set; }
    public string? RegistrationCode { get; set; }
    public string? Bank { get; set; }
    public string? BankAccount { get; set; }
}
