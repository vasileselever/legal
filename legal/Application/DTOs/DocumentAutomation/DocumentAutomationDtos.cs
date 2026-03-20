using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Application.DTOs.DocumentAutomation;

// ?? Template DTOs ????????????????????????????????????????????????????

public class DocumentTemplateListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentCategory Category { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public DocumentLanguage Language { get; set; }
    public int Version { get; set; }
    public bool IsSystemTemplate { get; set; }
    public bool IsActive { get; set; }
    public int EstimatedMinutes { get; set; }
    public int FieldCount { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DocumentTemplateDetailDto
{
    public Guid Id { get; set; }
    public Guid? FirmId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentCategory Category { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public DocumentLanguage Language { get; set; }
    public string BodyTemplate { get; set; } = string.Empty;
    public string? BodyTemplateEn { get; set; }
    public int Version { get; set; }
    public bool IsSystemTemplate { get; set; }
    public bool IsActive { get; set; }
    public int EstimatedMinutes { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<DocumentTemplateFieldDto> Fields { get; set; } = new();
    public List<TemplateClauseMappingDto> ClauseMappings { get; set; } = new();
}

public class CreateDocumentTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentCategory Category { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public DocumentLanguage Language { get; set; } = DocumentLanguage.Romanian;
    public string BodyTemplate { get; set; } = string.Empty;
    public string? BodyTemplateEn { get; set; }
    public int EstimatedMinutes { get; set; }
    public string? Tags { get; set; }

    public List<CreateDocumentTemplateFieldDto> Fields { get; set; } = new();
}

public class UpdateDocumentTemplateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DocumentCategory? Category { get; set; }
    public PracticeArea? PracticeArea { get; set; }
    public DocumentLanguage? Language { get; set; }
    public string? BodyTemplate { get; set; }
    public string? BodyTemplateEn { get; set; }
    public int? EstimatedMinutes { get; set; }
    public string? Tags { get; set; }
    public bool? IsActive { get; set; }
}

// ?? Field DTOs ???????????????????????????????????????????????????????

public class DocumentTemplateFieldDto
{
    public Guid Id { get; set; }
    public string FieldKey { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? LabelEn { get; set; }
    public string? HelpText { get; set; }
    public TemplateFieldType FieldType { get; set; }
    public int SortOrder { get; set; }
    public string? Section { get; set; }
    public bool IsRequired { get; set; }
    public string? DefaultValue { get; set; }
    public string? OptionsJson { get; set; }
    public string? ConditionJson { get; set; }
    public string? ValidationPattern { get; set; }
    public string? ValidationMessage { get; set; }
}

public class CreateDocumentTemplateFieldDto
{
    public string FieldKey { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? LabelEn { get; set; }
    public string? HelpText { get; set; }
    public TemplateFieldType FieldType { get; set; }
    public int SortOrder { get; set; }
    public string? Section { get; set; }
    public bool IsRequired { get; set; } = true;
    public string? DefaultValue { get; set; }
    public string? OptionsJson { get; set; }
    public string? ConditionJson { get; set; }
    public string? ValidationPattern { get; set; }
    public string? ValidationMessage { get; set; }
}

// ?? Clause Library DTOs ??????????????????????????????????????????????

public class ClauseLibraryItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ContentEn { get; set; }
    public DocumentCategory Category { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public ClauseRiskLevel RiskLevel { get; set; }
    public string? Commentary { get; set; }
    public string? LegalReferences { get; set; }
    public string? ApplicableLaw { get; set; }
    public bool IsMandatory { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateClauseLibraryItemDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ContentEn { get; set; }
    public DocumentCategory Category { get; set; }
    public PracticeArea PracticeArea { get; set; }
    public ClauseRiskLevel RiskLevel { get; set; } = ClauseRiskLevel.Neutral;
    public string? Commentary { get; set; }
    public string? LegalReferences { get; set; }
    public string? ApplicableLaw { get; set; }
    public bool IsMandatory { get; set; }
    public string? Tags { get; set; }
}

public class UpdateClauseLibraryItemDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? ContentEn { get; set; }
    public DocumentCategory? Category { get; set; }
    public PracticeArea? PracticeArea { get; set; }
    public ClauseRiskLevel? RiskLevel { get; set; }
    public string? Commentary { get; set; }
    public string? LegalReferences { get; set; }
    public string? ApplicableLaw { get; set; }
    public bool? IsMandatory { get; set; }
    public string? Tags { get; set; }
    public bool? IsActive { get; set; }
}

// ?? Template-Clause Mapping ??????????????????????????????????????????

public class TemplateClauseMappingDto
{
    public Guid Id { get; set; }
    public Guid ClauseId { get; set; }
    public string ClauseTitle { get; set; } = string.Empty;
    public ClauseRiskLevel ClauseRiskLevel { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public string? ConditionJson { get; set; }
}

public class AddClauseToTemplateDto
{
    public Guid ClauseId { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; } = true;
    public string? ConditionJson { get; set; }
}

// ?? Session / Interview DTOs ?????????????????????????????????????????

public class DocumentSessionListDto
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public DocumentCategory Category { get; set; }
    public DocumentSessionStatus Status { get; set; }
    public int ProgressPercent { get; set; }
    public string? Title { get; set; }
    public Guid? CaseId { get; set; }
    public Guid? ClientId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class DocumentSessionDetailDto
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public DocumentCategory Category { get; set; }
    public DocumentLanguage Language { get; set; }
    public DocumentSessionStatus Status { get; set; }
    public int CurrentFieldIndex { get; set; }
    public int ProgressPercent { get; set; }
    public string? Title { get; set; }
    public string? Notes { get; set; }
    public Guid? CaseId { get; set; }
    public Guid? ClientId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    /// <summary>All template fields for rendering the interview</summary>
    public List<DocumentTemplateFieldDto> Fields { get; set; } = new();

    /// <summary>Answers provided so far</summary>
    public List<DocumentSessionAnswerDto> Answers { get; set; } = new();
}

public class StartSessionDto
{
    public Guid TemplateId { get; set; }
    public DocumentLanguage Language { get; set; } = DocumentLanguage.Romanian;
    public Guid? CaseId { get; set; }
    public Guid? ClientId { get; set; }
    public string? Title { get; set; }
}

public class SubmitAnswersDto
{
    public List<AnswerItemDto> Answers { get; set; } = new();
}

public class AnswerItemDto
{
    public Guid FieldId { get; set; }
    public string Value { get; set; } = string.Empty;
}

public class DocumentSessionAnswerDto
{
    public Guid Id { get; set; }
    public Guid FieldId { get; set; }
    public string FieldKey { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

// ?? Generated Document DTOs ??????????????????????????????????????????

public class GeneratedDocumentListDto
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DocumentCategory Category { get; set; }
    public DocumentLanguage Language { get; set; }
    public int Version { get; set; }
    public int? ReadabilityScore { get; set; }
    public string? ExportedFilePath { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GeneratedDocumentDetailDto
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ContentHtml { get; set; } = string.Empty;
    public string? ContentHtmlEn { get; set; }
    public DocumentCategory Category { get; set; }
    public DocumentLanguage Language { get; set; }
    public int Version { get; set; }
    public int? ReadabilityScore { get; set; }
    public string? QualityCheckResultsJson { get; set; }
    public string FieldValuesJson { get; set; } = "{}";
    public string? ExportedFilePath { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ?? Quality Check DTO ????????????????????????????????????????????????

public class QualityCheckResultDto
{
    public bool Passed { get; set; }
    public int ReadabilityScore { get; set; }
    public List<QualityIssueDto> Issues { get; set; } = new();
}

public class QualityIssueDto
{
    public string Severity { get; set; } = "Warning"; // Warning, Error
    public string Message { get; set; } = string.Empty;
    public string? Field { get; set; }
}

// ?? Stats DTO ????????????????????????????????????????????????????????

public class DocumentAutomationStatsDto
{
    public int TotalTemplates { get; set; }
    public int TotalSessions { get; set; }
    public int CompletedSessions { get; set; }
    public int TotalGeneratedDocuments { get; set; }
    public int TotalClauses { get; set; }
    public Dictionary<string, int> DocumentsByCategory { get; set; } = new();
    public double AverageCompletionPercent { get; set; }
}
