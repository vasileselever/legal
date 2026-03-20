using LegalRO.CaseManagement.Domain.Common;

namespace LegalRO.CaseManagement.Domain.Entities;

/// <summary>
/// Firm entity representing a law firm
/// </summary>
public class Firm : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    
    /// <summary>
    /// CUI (Cod Unic de Înregistrare) - Romanian tax identification number
    /// </summary>
    public string? FiscalCode { get; set; }
    
    /// <summary>
    /// Bar association registration number
    /// </summary>
    public string? BarRegistrationNumber { get; set; }
    
    /// <summary>
    /// JSON field for additional settings
    /// </summary>
    public string? SettingsJson { get; set; }
    
    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Case> Cases { get; set; } = new List<Case>();
    public ICollection<Client> Clients { get; set; } = new List<Client>();
}
