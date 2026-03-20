using LegalRO.CaseManagement.Domain.Common;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;

/// <summary>
/// A field (interview question) that belongs to a DocumentTemplate.
/// Fields are rendered in order during the guided interview.
/// </summary>
public class DocumentTemplateField : BaseEntity
{
    public Guid TemplateId { get; set; }

    /// <summary>Machine-readable key used as placeholder in body template, e.g. "party_name"</summary>
    public string FieldKey { get; set; } = string.Empty;

    /// <summary>Human-readable label shown during interview</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>Optional English label for bilingual templates</summary>
    public string? LabelEn { get; set; }

    /// <summary>Help text / tooltip explaining the field</summary>
    public string? HelpText { get; set; }

    public TemplateFieldType FieldType { get; set; }

    /// <summary>Order of appearance in the interview</summary>
    public int SortOrder { get; set; }

    /// <summary>Section / group name for grouping questions</summary>
    public string? Section { get; set; }

    public bool IsRequired { get; set; } = true;

    /// <summary>Default value if not provided</summary>
    public string? DefaultValue { get; set; }

    /// <summary>
    /// JSON array of options for SingleChoice / MultipleChoice fields.
    /// E.g. ["SRL","SA","PFA"]
    /// </summary>
    public string? OptionsJson { get; set; }

    /// <summary>
    /// Conditional visibility rule in JSON, e.g.:
    /// { "field": "is_corporate", "operator": "eq", "value": "true" }
    /// </summary>
    public string? ConditionJson { get; set; }

    /// <summary>Validation regex pattern (optional)</summary>
    public string? ValidationPattern { get; set; }

    /// <summary>Validation error message</summary>
    public string? ValidationMessage { get; set; }

    // Navigation
    public DocumentTemplate Template { get; set; } = null!;
}
