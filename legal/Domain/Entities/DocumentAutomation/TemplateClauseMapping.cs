using LegalRO.CaseManagement.Domain.Common;

namespace LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;

/// <summary>
/// Many-to-many mapping between templates and clause library items.
/// Tracks which clauses are used in which template and their position.
/// </summary>
public class TemplateClauseMapping : BaseEntity
{
    public Guid TemplateId { get; set; }
    public Guid ClauseId { get; set; }

    /// <summary>Order of the clause within the template</summary>
    public int SortOrder { get; set; }

    /// <summary>Whether this clause is mandatory in the generated document</summary>
    public bool IsRequired { get; set; } = true;

    /// <summary>
    /// Conditional inclusion rule in JSON, e.g.:
    /// { "field": "include_penalty_clause", "operator": "eq", "value": "true" }
    /// Null = always included.
    /// </summary>
    public string? ConditionJson { get; set; }

    // Navigation
    public DocumentTemplate Template { get; set; } = null!;
    public ClauseLibraryItem Clause { get; set; } = null!;
}
