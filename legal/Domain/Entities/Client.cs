using LegalRO.CaseManagement.Domain.Common;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Client entity representing individual or corporate clients
/// </summary>
public class Client : BaseEntity
{
    public Guid FirmId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    
    /// <summary>
    /// For corporate clients - CUI (Romanian tax ID)
    /// </summary>
    public string? FiscalCode { get; set; }

    /// <summary>
    /// For corporate clients - Trade register code (e.g. J40/1234/2020)
    /// </summary>
    public string? RegistrationCode { get; set; }

    /// <summary>
    /// Bank name
    /// </summary>
    public string? Bank { get; set; }

    /// <summary>
    /// IBAN / bank account number
    /// </summary>
    public string? BankAccount { get; set; }

    /// <summary>
    /// For individual clients - CNP (Romanian personal ID)
    /// </summary>
    public string? PersonalIdentificationNumber { get; set; }
    
    public bool IsCorporate { get; set; } = false;
    public string? Notes { get; set; }
    
    // Navigation properties
    public Firm Firm { get; set; } = null!;
    public ICollection<Case> Cases { get; set; } = new List<Case>();
}
