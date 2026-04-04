using System.Text.Json;
using System.Text.RegularExpressions;
using LegalRO.CaseManagement.Application.DTOs.DocumentAutomation;
using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;
using LegalRO.CaseManagement.Domain.Enums;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LegalRO.CaseManagement.Infrastructure.Services;

/// <summary>
/// Implementation of the Document Automation service – covers template CRUD,
/// guided interview sessions, placeholder-based document generation,
/// clause library management and basic quality assurance.
/// </summary>
public class DocumentAutomationService : IDocumentAutomationService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<DocumentAutomationService> _logger;

    private static readonly Regex PlaceholderRegex = new(@"\{\{(\w+)\}\}", RegexOptions.Compiled);

    public DocumentAutomationService(ApplicationDbContext db, ILogger<DocumentAutomationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Templates
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<List<DocumentTemplateListDto>> GetTemplatesAsync(
        Guid firmId, DocumentCategory? category, PracticeArea? practiceArea,
        string? search, CancellationToken ct)
    {
        var q = _db.DocumentTemplates
            .Where(t => t.FirmId == firmId || t.IsSystemTemplate)
            .Where(t => t.IsActive)
            .AsQueryable();

        if (category.HasValue) q = q.Where(t => t.Category == category.Value);
        if (practiceArea.HasValue) q = q.Where(t => t.PracticeArea == practiceArea.Value);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(t => t.Name.Contains(search) || (t.Description != null && t.Description.Contains(search)));

        return await q.OrderBy(t => t.Category).ThenBy(t => t.Name)
            .Select(t => new DocumentTemplateListDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                Category = t.Category,
                PracticeArea = t.PracticeArea,
                Language = t.Language,
                Version = t.Version,
                IsSystemTemplate = t.IsSystemTemplate,
                IsActive = t.IsActive,
                EstimatedMinutes = t.EstimatedMinutes,
                FieldCount = t.Fields.Count,
                Tags = t.Tags,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<DocumentTemplateDetailDto?> GetTemplateByIdAsync(Guid firmId, Guid templateId, CancellationToken ct)
    {
        var t = await _db.DocumentTemplates
            .Include(x => x.Fields.OrderBy(f => f.SortOrder))
            .Include(x => x.ClauseMappings).ThenInclude(m => m.Clause)
            .FirstOrDefaultAsync(x => x.Id == templateId && (x.FirmId == firmId || x.IsSystemTemplate), ct);

        return t == null ? null : MapTemplateDetail(t);
    }

    public async Task<DocumentTemplateDetailDto> CreateTemplateAsync(Guid firmId, CreateDocumentTemplateDto dto, CancellationToken ct)
    {
        var template = new DocumentTemplate
        {
            FirmId = firmId,
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            PracticeArea = dto.PracticeArea,
            Language = dto.Language,
            BodyTemplate = dto.BodyTemplate,
            BodyTemplateEn = dto.BodyTemplateEn,
            EstimatedMinutes = dto.EstimatedMinutes,
            Tags = dto.Tags
        };

        foreach (var f in dto.Fields)
        {
            template.Fields.Add(new DocumentTemplateField
            {
                FieldKey = f.FieldKey,
                Label = f.Label,
                LabelEn = f.LabelEn,
                HelpText = f.HelpText,
                FieldType = f.FieldType,
                SortOrder = f.SortOrder,
                Section = f.Section,
                IsRequired = f.IsRequired,
                DefaultValue = f.DefaultValue,
                OptionsJson = f.OptionsJson,
                ConditionJson = f.ConditionJson,
                ValidationPattern = f.ValidationPattern,
                ValidationMessage = f.ValidationMessage
            });
        }

        _db.DocumentTemplates.Add(template);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Template {TemplateId} created by firm {FirmId}", template.Id, firmId);

        return MapTemplateDetail(template);
    }

    public async Task<DocumentTemplateDetailDto?> UpdateTemplateAsync(Guid firmId, Guid templateId, UpdateDocumentTemplateDto dto, CancellationToken ct)
    {
        var t = await _db.DocumentTemplates
            .Include(x => x.Fields.OrderBy(f => f.SortOrder))
            .Include(x => x.ClauseMappings).ThenInclude(m => m.Clause)
            .FirstOrDefaultAsync(x => x.Id == templateId && x.FirmId == firmId, ct);
        if (t == null) return null;

        // Update basic properties
        if (dto.Name is not null) t.Name = dto.Name;
        if (dto.Description is not null) t.Description = dto.Description;
        if (dto.Category.HasValue) t.Category = dto.Category.Value;
        if (dto.PracticeArea.HasValue) t.PracticeArea = dto.PracticeArea.Value;
        if (dto.Language.HasValue) t.Language = dto.Language.Value;
        if (dto.BodyTemplate is not null) { t.BodyTemplate = dto.BodyTemplate; t.Version++; }
        if (dto.BodyTemplateEn is not null) t.BodyTemplateEn = dto.BodyTemplateEn;
        if (dto.EstimatedMinutes.HasValue) t.EstimatedMinutes = dto.EstimatedMinutes.Value;
        if (dto.Tags is not null) t.Tags = dto.Tags;
        if (dto.IsActive.HasValue) t.IsActive = dto.IsActive.Value;

        // Handle field updates if provided
        if (dto.Fields.Count > 0)
        {
            // Collect IDs of fields being updated
            var incomingFieldIds = dto.Fields.Where(f => f.Id.HasValue).Select(f => f.Id!.Value).ToHashSet();
            var existingFieldIds = t.Fields.Where(f => !f.IsDeleted).Select(f => f.Id).ToHashSet();

            // Mark fields that are not in the incoming list as deleted (soft delete)
            foreach (var field in t.Fields.Where(f => !f.IsDeleted && !incomingFieldIds.Contains(f.Id)))
            {
                field.IsDeleted = true;
            }

            // Update or create fields
            foreach (var dtoField in dto.Fields)
            {
                if (dtoField.Id.HasValue && existingFieldIds.Contains(dtoField.Id.Value))
                {
                    // Update existing field
                    var existing = t.Fields.FirstOrDefault(f => f.Id == dtoField.Id.Value);
                    if (existing != null && !existing.IsDeleted)
                    {
                        existing.FieldKey = dtoField.FieldKey;
                        existing.Label = dtoField.Label;
                        existing.LabelEn = dtoField.LabelEn;
                        existing.HelpText = dtoField.HelpText;
                        existing.FieldType = dtoField.FieldType;
                        existing.SortOrder = dtoField.SortOrder;
                        existing.Section = dtoField.Section;
                        existing.IsRequired = dtoField.IsRequired;
                        existing.DefaultValue = dtoField.DefaultValue;
                        existing.OptionsJson = dtoField.OptionsJson;
                        existing.ConditionJson = dtoField.ConditionJson;
                        existing.ValidationPattern = dtoField.ValidationPattern;
                        existing.ValidationMessage = dtoField.ValidationMessage;
                    }
                }
                else if (!dtoField.Id.HasValue || !existingFieldIds.Contains(dtoField.Id.Value))
                {
                    // Create new field
                    var newField = new DocumentTemplateField
                    {
                        TemplateId = templateId,
                        FieldKey = dtoField.FieldKey,
                        Label = dtoField.Label,
                        LabelEn = dtoField.LabelEn,
                        HelpText = dtoField.HelpText,
                        FieldType = dtoField.FieldType,
                        SortOrder = dtoField.SortOrder,
                        Section = dtoField.Section,
                        IsRequired = dtoField.IsRequired,
                        DefaultValue = dtoField.DefaultValue,
                        OptionsJson = dtoField.OptionsJson,
                        ConditionJson = dtoField.ConditionJson,
                        ValidationPattern = dtoField.ValidationPattern,
                        ValidationMessage = dtoField.ValidationMessage
                    };
                    t.Fields.Add(newField);
                }
            }
        }

        await _db.SaveChangesAsync(ct);
        
        // Reload to get updated relationships
        await _db.Entry(t).Collection(x => x.Fields).LoadAsync(ct);
        await _db.Entry(t).Collection(x => x.ClauseMappings).LoadAsync(ct);
        
        return MapTemplateDetail(t);
    }

    public async Task<bool> DeleteTemplateAsync(Guid firmId, Guid templateId, CancellationToken ct)
    {
        var t = await _db.DocumentTemplates.FirstOrDefaultAsync(x => x.Id == templateId && x.FirmId == firmId, ct);
        if (t == null) return false;
        t.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Template Fields
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<DocumentTemplateFieldDto> AddFieldAsync(Guid firmId, Guid templateId, CreateDocumentTemplateFieldDto dto, CancellationToken ct)
    {
        _ = await _db.DocumentTemplates.FirstOrDefaultAsync(x => x.Id == templateId && x.FirmId == firmId, ct)
            ?? throw new InvalidOperationException("Template not found");

        var field = new DocumentTemplateField
        {
            TemplateId = templateId,
            FieldKey = dto.FieldKey,
            Label = dto.Label,
            LabelEn = dto.LabelEn,
            HelpText = dto.HelpText,
            FieldType = dto.FieldType,
            SortOrder = dto.SortOrder,
            Section = dto.Section,
            IsRequired = dto.IsRequired,
            DefaultValue = dto.DefaultValue,
            OptionsJson = dto.OptionsJson,
            ConditionJson = dto.ConditionJson,
            ValidationPattern = dto.ValidationPattern,
            ValidationMessage = dto.ValidationMessage
        };

        _db.DocumentTemplateFields.Add(field);
        await _db.SaveChangesAsync(ct);

        return MapField(field);
    }

    public async Task<bool> RemoveFieldAsync(Guid firmId, Guid templateId, Guid fieldId, CancellationToken ct)
    {
        var field = await _db.DocumentTemplateFields
            .Include(f => f.Template)
            .FirstOrDefaultAsync(f => f.Id == fieldId && f.TemplateId == templateId && f.Template.FirmId == firmId, ct);
        if (field == null) return false;
        field.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Clause Library
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<List<ClauseLibraryItemDto>> GetClausesAsync(
        Guid firmId, DocumentCategory? category, PracticeArea? practiceArea,
        ClauseRiskLevel? riskLevel, string? search, CancellationToken ct)
    {
        var q = _db.ClauseLibraryItems
            .Where(c => c.FirmId == firmId || c.FirmId == null)
            .Where(c => c.IsActive)
            .AsQueryable();

        if (category.HasValue) q = q.Where(c => c.Category == category.Value);
        if (practiceArea.HasValue) q = q.Where(c => c.PracticeArea == practiceArea.Value);
        if (riskLevel.HasValue) q = q.Where(c => c.RiskLevel == riskLevel.Value);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(c => c.Title.Contains(search) || c.Content.Contains(search));

        return await q.OrderBy(c => c.Category).ThenBy(c => c.Title)
            .Select(c => new ClauseLibraryItemDto
            {
                Id = c.Id,
                Title = c.Title,
                Content = c.Content,
                ContentEn = c.ContentEn,
                Category = c.Category,
                PracticeArea = c.PracticeArea,
                RiskLevel = c.RiskLevel,
                Commentary = c.Commentary,
                LegalReferences = c.LegalReferences,
                ApplicableLaw = c.ApplicableLaw,
                IsMandatory = c.IsMandatory,
                Tags = c.Tags,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<ClauseLibraryItemDto?> GetClauseByIdAsync(Guid firmId, Guid clauseId, CancellationToken ct)
    {
        var c = await _db.ClauseLibraryItems
            .FirstOrDefaultAsync(x => x.Id == clauseId && (x.FirmId == firmId || x.FirmId == null), ct);
        return c == null ? null : MapClause(c);
    }

    public async Task<ClauseLibraryItemDto> CreateClauseAsync(Guid firmId, CreateClauseLibraryItemDto dto, CancellationToken ct)
    {
        var clause = new ClauseLibraryItem
        {
            FirmId = firmId,
            Title = dto.Title,
            Content = dto.Content,
            ContentEn = dto.ContentEn,
            Category = dto.Category,
            PracticeArea = dto.PracticeArea,
            RiskLevel = dto.RiskLevel,
            Commentary = dto.Commentary,
            LegalReferences = dto.LegalReferences,
            ApplicableLaw = dto.ApplicableLaw,
            IsMandatory = dto.IsMandatory,
            Tags = dto.Tags
        };

        _db.ClauseLibraryItems.Add(clause);
        await _db.SaveChangesAsync(ct);
        return MapClause(clause);
    }

    public async Task<ClauseLibraryItemDto?> UpdateClauseAsync(Guid firmId, Guid clauseId, UpdateClauseLibraryItemDto dto, CancellationToken ct)
    {
        var c = await _db.ClauseLibraryItems.FirstOrDefaultAsync(x => x.Id == clauseId && x.FirmId == firmId, ct);
        if (c == null) return null;

        if (dto.Title is not null) c.Title = dto.Title;
        if (dto.Content is not null) c.Content = dto.Content;
        if (dto.ContentEn is not null) c.ContentEn = dto.ContentEn;
        if (dto.Category.HasValue) c.Category = dto.Category.Value;
        if (dto.PracticeArea.HasValue) c.PracticeArea = dto.PracticeArea.Value;
        if (dto.RiskLevel.HasValue) c.RiskLevel = dto.RiskLevel.Value;
        if (dto.Commentary is not null) c.Commentary = dto.Commentary;
        if (dto.LegalReferences is not null) c.LegalReferences = dto.LegalReferences;
        if (dto.ApplicableLaw is not null) c.ApplicableLaw = dto.ApplicableLaw;
        if (dto.IsMandatory.HasValue) c.IsMandatory = dto.IsMandatory.Value;
        if (dto.Tags is not null) c.Tags = dto.Tags;
        if (dto.IsActive.HasValue) c.IsActive = dto.IsActive.Value;

        await _db.SaveChangesAsync(ct);
        return MapClause(c);
    }

    public async Task<bool> DeleteClauseAsync(Guid firmId, Guid clauseId, CancellationToken ct)
    {
        var c = await _db.ClauseLibraryItems.FirstOrDefaultAsync(x => x.Id == clauseId && x.FirmId == firmId, ct);
        if (c == null) return false;
        c.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Template-Clause Mapping
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<TemplateClauseMappingDto> AddClauseToTemplateAsync(Guid firmId, Guid templateId, AddClauseToTemplateDto dto, CancellationToken ct)
    {
        _ = await _db.DocumentTemplates.FirstOrDefaultAsync(t => t.Id == templateId && t.FirmId == firmId, ct)
            ?? throw new InvalidOperationException("Template not found");
        var clause = await _db.ClauseLibraryItems.FirstOrDefaultAsync(c => c.Id == dto.ClauseId && (c.FirmId == firmId || c.FirmId == null), ct)
            ?? throw new InvalidOperationException("Clause not found");

        var mapping = new TemplateClauseMapping
        {
            TemplateId = templateId,
            ClauseId = dto.ClauseId,
            SortOrder = dto.SortOrder,
            IsRequired = dto.IsRequired,
            ConditionJson = dto.ConditionJson
        };

        _db.TemplateClauseMappings.Add(mapping);
        await _db.SaveChangesAsync(ct);

        return new TemplateClauseMappingDto
        {
            Id = mapping.Id,
            ClauseId = clause.Id,
            ClauseTitle = clause.Title,
            ClauseRiskLevel = clause.RiskLevel,
            SortOrder = mapping.SortOrder,
            IsRequired = mapping.IsRequired,
            ConditionJson = mapping.ConditionJson
        };
    }

    public async Task<bool> RemoveClauseFromTemplateAsync(Guid firmId, Guid templateId, Guid mappingId, CancellationToken ct)
    {
        var mapping = await _db.TemplateClauseMappings
            .Include(m => m.Template)
            .FirstOrDefaultAsync(m => m.Id == mappingId && m.TemplateId == templateId && m.Template.FirmId == firmId, ct);
        if (mapping == null) return false;
        mapping.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Sessions (Guided Interview)
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<List<DocumentSessionListDto>> GetSessionsAsync(Guid firmId, Guid userId, DocumentSessionStatus? status, CancellationToken ct)
    {
        var q = _db.DocumentSessions
            .Include(s => s.Template)
            .Where(s => s.FirmId == firmId && s.UserId == userId)
            .AsQueryable();

        if (status.HasValue) q = q.Where(s => s.Status == status.Value);

        return await q.OrderByDescending(s => s.CreatedAt)
            .Select(s => new DocumentSessionListDto
            {
                Id = s.Id,
                TemplateId = s.TemplateId,
                TemplateName = s.Template.Name,
                Category = s.Template.Category,
                Status = s.Status,
                ProgressPercent = s.ProgressPercent,
                Title = s.Title,
                CaseId = s.CaseId,
                ClientId = s.ClientId,
                CreatedAt = s.CreatedAt,
                CompletedAt = s.CompletedAt
            })
            .ToListAsync(ct);
    }

    public async Task<DocumentSessionDetailDto?> GetSessionByIdAsync(Guid firmId, Guid sessionId, CancellationToken ct)
    {
        var s = await _db.DocumentSessions
            .Include(x => x.Template).ThenInclude(t => t.Fields.OrderBy(f => f.SortOrder))
            .Include(x => x.Answers).ThenInclude(a => a.Field)
            .FirstOrDefaultAsync(x => x.Id == sessionId && x.FirmId == firmId, ct);

        return s == null ? null : MapSessionDetail(s);
    }

    public async Task<DocumentSessionDetailDto> StartSessionAsync(Guid firmId, Guid userId, StartSessionDto dto, CancellationToken ct)
    {
        var template = await _db.DocumentTemplates
            .Include(t => t.Fields.OrderBy(f => f.SortOrder))
            .FirstOrDefaultAsync(t => t.Id == dto.TemplateId && (t.FirmId == firmId || t.IsSystemTemplate) && t.IsActive, ct)
            ?? throw new InvalidOperationException("Template not found or inactive");

        var session = new DocumentSession
        {
            FirmId = firmId,
            UserId = userId,
            TemplateId = dto.TemplateId,
            Language = dto.Language,
            CaseId = dto.CaseId,
            ClientId = dto.ClientId,
            Title = dto.Title ?? template.Name,
            Status = DocumentSessionStatus.InProgress
        };

        _db.DocumentSessions.Add(session);
        await _db.SaveChangesAsync(ct);

        // Reload with navigation
        var loaded = await _db.DocumentSessions
            .Include(x => x.Template).ThenInclude(t => t.Fields.OrderBy(f => f.SortOrder))
            .Include(x => x.Answers)
            .FirstAsync(x => x.Id == session.Id, ct);

        _logger.LogInformation("Session {SessionId} started for template {TemplateId} by user {UserId}",
            session.Id, dto.TemplateId, userId);

        return MapSessionDetail(loaded);
    }

    public async Task<DocumentSessionDetailDto?> SubmitAnswersAsync(Guid firmId, Guid sessionId, SubmitAnswersDto dto, CancellationToken ct)
    {
        var session = await _db.DocumentSessions
            .Include(s => s.Template).ThenInclude(t => t.Fields.OrderBy(f => f.SortOrder))
            .Include(s => s.Answers)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.FirmId == firmId, ct);

        if (session == null) return null;
        if (session.Status == DocumentSessionStatus.Abandoned)
            throw new InvalidOperationException("Session is abandoned");

        var validFieldIds = session.Template.Fields.Select(f => f.Id).ToHashSet();

        foreach (var a in dto.Answers)
        {
            if (!validFieldIds.Contains(a.FieldId))
                continue;

            var existing = session.Answers.FirstOrDefault(x => x.FieldId == a.FieldId);
            if (existing != null)
            {
                existing.Value = a.Value;
            }
            else
            {
                var answer = new DocumentSessionAnswer
                {
                    SessionId = sessionId,
                    FieldId = a.FieldId,
                    Value = a.Value
                };
                _db.DocumentSessionAnswers.Add(answer);
                session.Answers.Add(answer);
            }
        }

        // Update progress
        var totalFields = session.Template.Fields.Count;
        var answeredFields = session.Answers.Count;
        session.ProgressPercent = totalFields > 0 ? (int)((double)answeredFields / totalFields * 100) : 0;
        session.CurrentFieldIndex = answeredFields;

        // Mark as completed once all required fields are answered, but keep
        // accepting further saves so optional fields in later sections still work.
        var requiredFieldIds = session.Template.Fields.Where(f => f.IsRequired).Select(f => f.Id).ToHashSet();
        var answeredFieldIds = session.Answers.Select(a => a.FieldId).ToHashSet();
        if (requiredFieldIds.All(id => answeredFieldIds.Contains(id)))
        {
            session.Status = DocumentSessionStatus.Completed;
            session.CompletedAt ??= DateTime.UtcNow;
            session.ProgressPercent = 100;
        }

        await _db.SaveChangesAsync(ct);

        // Reload answers with Field navigation for mapping
        await _db.Entry(session).Collection(s => s.Answers).Query()
            .Include(a => a.Field).LoadAsync(ct);

        return MapSessionDetail(session);
    }

    public async Task<bool> AbandonSessionAsync(Guid firmId, Guid sessionId, CancellationToken ct)
    {
        var session = await _db.DocumentSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.FirmId == firmId, ct);
        if (session == null) return false;
        session.Status = DocumentSessionStatus.Abandoned;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Document Generation
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<GeneratedDocumentDetailDto?> GenerateDocumentAsync(Guid firmId, Guid userId, Guid sessionId, CancellationToken ct)
    {
        var session = await _db.DocumentSessions
            .Include(s => s.Template).ThenInclude(t => t.Fields)
            .Include(s => s.Template).ThenInclude(t => t.ClauseMappings).ThenInclude(m => m.Clause)
            .Include(s => s.Answers).ThenInclude(a => a.Field)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.FirmId == firmId, ct);

        if (session == null) return null;

        // Build field-value dictionary
        var fieldValues = new Dictionary<string, string>();
        foreach (var ans in session.Answers)
        {
            fieldValues[ans.Field.FieldKey] = ans.Value;
        }
        // Fill defaults for unanswered optional fields
        foreach (var field in session.Template.Fields)
        {
            if (!fieldValues.ContainsKey(field.FieldKey) && field.DefaultValue != null)
                fieldValues[field.FieldKey] = field.DefaultValue;
        }

        // Replace placeholders in body template
        var htmlContent = ReplacePlaceholders(session.Template.BodyTemplate, fieldValues);

        // Append clauses whose conditions are met
        var clauseHtml = BuildClauseSection(session.Template.ClauseMappings, fieldValues, useEnglish: false);
        if (!string.IsNullOrEmpty(clauseHtml))
            htmlContent += clauseHtml;

        // English version if bilingual
        string? htmlContentEn = null;
        if (session.Language == DocumentLanguage.Bilingual || session.Language == DocumentLanguage.English)
        {
            var bodyEn = session.Template.BodyTemplateEn ?? session.Template.BodyTemplate;
            htmlContentEn = ReplacePlaceholders(bodyEn, fieldValues);
            var clauseEnHtml = BuildClauseSection(session.Template.ClauseMappings, fieldValues, useEnglish: true);
            if (!string.IsNullOrEmpty(clauseEnHtml))
                htmlContentEn += clauseEnHtml;
        }

        // Determine next version
        var maxVersion = await _db.GeneratedDocuments
            .Where(g => g.SessionId == sessionId)
            .MaxAsync(g => (int?)g.Version, ct) ?? 0;

        var doc = new GeneratedDocument
        {
            SessionId = sessionId,
            FirmId = firmId,
            GeneratedByUserId = userId,
            Title = session.Title ?? session.Template.Name,
            ContentHtml = htmlContent,
            ContentHtmlEn = htmlContentEn,
            Language = session.Language,
            Category = session.Template.Category,
            Version = maxVersion + 1,
            FieldValuesJson = JsonSerializer.Serialize(fieldValues)
        };

        _db.GeneratedDocuments.Add(doc);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Document {DocId} v{Version} generated from session {SessionId}",
            doc.Id, doc.Version, sessionId);

        return MapGeneratedDocumentDetail(doc);
    }

    public async Task<List<GeneratedDocumentListDto>> GetGeneratedDocumentsAsync(Guid firmId, Guid? sessionId, CancellationToken ct)
    {
        var q = _db.GeneratedDocuments.Where(g => g.FirmId == firmId).AsQueryable();
        if (sessionId.HasValue) q = q.Where(g => g.SessionId == sessionId.Value);

        return await q.OrderByDescending(g => g.CreatedAt)
            .Select(g => new GeneratedDocumentListDto
            {
                Id = g.Id,
                SessionId = g.SessionId,
                Title = g.Title,
                Category = g.Category,
                Language = g.Language,
                Version = g.Version,
                ReadabilityScore = g.ReadabilityScore,
                ExportedFilePath = g.ExportedFilePath,
                CreatedAt = g.CreatedAt,
                LinkedLeads = _db.LeadDocuments
                    .Where(ld => ld.GeneratedDocumentId == g.Id)
                    .Select(ld => new LinkedLeadDto
                    {
                        LeadId = ld.LeadId,
                        LeadName = ld.Lead.Name
                    })
                    .ToList()
            })
            .ToListAsync(ct);
    }

    public async Task<GeneratedDocumentDetailDto?> GetGeneratedDocumentByIdAsync(Guid firmId, Guid documentId, CancellationToken ct)
    {
        var g = await _db.GeneratedDocuments.FirstOrDefaultAsync(x => x.Id == documentId && x.FirmId == firmId, ct);
        return g == null ? null : MapGeneratedDocumentDetail(g);
    }

    public async Task<bool> DeleteGeneratedDocumentAsync(Guid firmId, Guid documentId, CancellationToken ct)
    {
        var g = await _db.GeneratedDocuments.FirstOrDefaultAsync(x => x.Id == documentId && x.FirmId == firmId, ct);
        if (g == null) return false;
        g.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Quality Assurance
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<QualityCheckResultDto> RunQualityCheckAsync(Guid firmId, Guid generatedDocumentId, CancellationToken ct)
    {
        var doc = await _db.GeneratedDocuments
            .Include(g => g.Session).ThenInclude(s => s.Template).ThenInclude(t => t.Fields)
            .Include(g => g.Session).ThenInclude(s => s.Template).ThenInclude(t => t.ClauseMappings).ThenInclude(m => m.Clause)
            .Include(g => g.Session).ThenInclude(s => s.Answers)
            .FirstOrDefaultAsync(g => g.Id == generatedDocumentId && g.FirmId == firmId, ct)
            ?? throw new InvalidOperationException("Generated document not found");

        var issues = new List<QualityIssueDto>();

        // 1. Check all required fields have values
        var fieldValues = JsonSerializer.Deserialize<Dictionary<string, string>>(doc.FieldValuesJson) ?? new();
        foreach (var field in doc.Session.Template.Fields.Where(f => f.IsRequired))
        {
            if (!fieldValues.TryGetValue(field.FieldKey, out var val) || string.IsNullOrWhiteSpace(val))
            {
                issues.Add(new QualityIssueDto
                {
                    Severity = "Error",
                    Message = $"Câmpul obligatoriu '{field.Label}' nu are o valoare.",
                    Field = field.FieldKey
                });
            }
        }

        // 2. Check mandatory clauses are included
        foreach (var mapping in doc.Session.Template.ClauseMappings.Where(m => m.Clause.IsMandatory))
        {
            var snippet = mapping.Clause.Content.Length > 50
                ? mapping.Clause.Content[..50]
                : mapping.Clause.Content;

            if (!doc.ContentHtml.Contains(mapping.Clause.Title, StringComparison.OrdinalIgnoreCase) &&
                !doc.ContentHtml.Contains(snippet, StringComparison.OrdinalIgnoreCase))
            {
                issues.Add(new QualityIssueDto
                {
                    Severity = "Error",
                    Message = $"Clauza obligatorie '{mapping.Clause.Title}' lipseste din document."
                });
            }
        }

        // 3. Check for unresolved placeholders
        var unresolvedMatches = PlaceholderRegex.Matches(doc.ContentHtml);
        foreach (Match match in unresolvedMatches)
        {
            issues.Add(new QualityIssueDto
            {
                Severity = "Warning",
                Message = $"Placeholder nerezolvat: {match.Value}",
                Field = match.Groups[1].Value
            });
        }

        // 4. Simple readability score (word count heuristic)
        var wordCount = doc.ContentHtml.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        var readability = wordCount switch
        {
            < 100 => 95,
            < 500 => 85,
            < 2000 => 75,
            < 5000 => 65,
            _ => 55
        };

        // Persist
        doc.ReadabilityScore = readability;
        var result = new QualityCheckResultDto
        {
            Passed = issues.All(i => i.Severity != "Error"),
            ReadabilityScore = readability,
            Issues = issues
        };
        doc.QualityCheckResultsJson = JsonSerializer.Serialize(result);
        await _db.SaveChangesAsync(ct);

        return result;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Statistics
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    public async Task<DocumentAutomationStatsDto> GetStatsAsync(Guid firmId, CancellationToken ct)
    {
        var templates = await _db.DocumentTemplates
            .CountAsync(t => (t.FirmId == firmId || t.IsSystemTemplate) && t.IsActive, ct);

        var sessions = await _db.DocumentSessions
            .Where(s => s.FirmId == firmId)
            .ToListAsync(ct);

        var generatedDocs = await _db.GeneratedDocuments
            .Where(g => g.FirmId == firmId)
            .ToListAsync(ct);

        var clauses = await _db.ClauseLibraryItems
            .CountAsync(c => (c.FirmId == firmId || c.FirmId == null) && c.IsActive, ct);

        var byCategory = generatedDocs
            .GroupBy(g => g.Category.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        return new DocumentAutomationStatsDto
        {
            TotalTemplates = templates,
            TotalSessions = sessions.Count,
            CompletedSessions = sessions.Count(s => s.Status == DocumentSessionStatus.Completed),
            TotalGeneratedDocuments = generatedDocs.Count,
            TotalClauses = clauses,
            DocumentsByCategory = byCategory,
            AverageCompletionPercent = sessions.Count > 0 ? sessions.Average(s => s.ProgressPercent) : 0
        };
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //  Private Helpers
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    private static string ReplacePlaceholders(string template, Dictionary<string, string> values)
    {
        return PlaceholderRegex.Replace(template, match =>
        {
            var key = match.Groups[1].Value;
            return values.TryGetValue(key, out var val) ? val : match.Value;
        });
    }

    private static string BuildClauseSection(
        ICollection<TemplateClauseMapping> mappings,
        Dictionary<string, string> fieldValues,
        bool useEnglish)
    {
        if (mappings.Count == 0) return string.Empty;

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("<div class=\"clauses-section\">");

        foreach (var m in mappings.OrderBy(x => x.SortOrder))
        {
            if (m.IsDeleted) continue;

            // Evaluate condition
            if (!string.IsNullOrWhiteSpace(m.ConditionJson) && !EvaluateCondition(m.ConditionJson, fieldValues))
                continue;

            var content = useEnglish && !string.IsNullOrWhiteSpace(m.Clause.ContentEn)
                ? m.Clause.ContentEn
                : m.Clause.Content;

            sb.AppendLine($"<div class=\"clause\" data-risk=\"{m.Clause.RiskLevel}\">");
            sb.AppendLine($"<h4>{m.Clause.Title}</h4>");
            sb.AppendLine($"<p>{ReplacePlaceholders(content, fieldValues)}</p>");
            if (!string.IsNullOrWhiteSpace(m.Clause.ApplicableLaw))
                sb.AppendLine($"<small class=\"legal-ref\">{m.Clause.ApplicableLaw}</small>");
            sb.AppendLine("</div>");
        }

        sb.AppendLine("</div>");
        return sb.ToString();
    }

    private static bool EvaluateCondition(string conditionJson, Dictionary<string, string> fieldValues)
    {
        try
        {
            var condition = JsonSerializer.Deserialize<ConditionRule>(conditionJson);
            if (condition == null) return true;

            fieldValues.TryGetValue(condition.Field, out var actual);
            actual ??= string.Empty;

            return condition.Operator?.ToLowerInvariant() switch
            {
                "eq" => string.Equals(actual, condition.Value, StringComparison.OrdinalIgnoreCase),
                "neq" => !string.Equals(actual, condition.Value, StringComparison.OrdinalIgnoreCase),
                "contains" => actual.Contains(condition.Value ?? "", StringComparison.OrdinalIgnoreCase),
                "notempty" => !string.IsNullOrWhiteSpace(actual),
                _ => true
            };
        }
        catch
        {
            return true; // fail-open
        }
    }

    private sealed class ConditionRule
    {
        public string Field { get; set; } = string.Empty;
        public string? Operator { get; set; }
        public string? Value { get; set; }
    }

    // >> Mapping helpers >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    private static DocumentTemplateDetailDto MapTemplateDetail(DocumentTemplate t) => new()
    {
        Id = t.Id,
        FirmId = t.FirmId,
        Name = t.Name,
        Description = t.Description,
        Category = t.Category,
        PracticeArea = t.PracticeArea,
        Language = t.Language,
        BodyTemplate = t.BodyTemplate,
        BodyTemplateEn = t.BodyTemplateEn,
        Version = t.Version,
        IsSystemTemplate = t.IsSystemTemplate,
        IsActive = t.IsActive,
        EstimatedMinutes = t.EstimatedMinutes,
        Tags = t.Tags,
        CreatedAt = t.CreatedAt,
        Fields = t.Fields.Where(f => !f.IsDeleted).OrderBy(f => f.SortOrder).Select(MapField).ToList(),
        ClauseMappings = t.ClauseMappings
            .Where(m => !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .Select(m => new TemplateClauseMappingDto
            {
                Id = m.Id,
                ClauseId = m.ClauseId,
                ClauseTitle = m.Clause?.Title ?? "",
                ClauseRiskLevel = m.Clause?.RiskLevel ?? ClauseRiskLevel.Neutral,
                SortOrder = m.SortOrder,
                IsRequired = m.IsRequired,
                ConditionJson = m.ConditionJson
            }).ToList()
    };

    private static DocumentTemplateFieldDto MapField(DocumentTemplateField f) => new()
    {
        Id = f.Id,
        FieldKey = f.FieldKey,
        Label = f.Label,
        LabelEn = f.LabelEn,
        HelpText = f.HelpText,
        FieldType = f.FieldType,
        SortOrder = f.SortOrder,
        Section = f.Section,
        IsRequired = f.IsRequired,
        DefaultValue = f.DefaultValue,
        OptionsJson = f.OptionsJson,
        ConditionJson = f.ConditionJson,
        ValidationPattern = f.ValidationPattern,
        ValidationMessage = f.ValidationMessage
    };

    private static ClauseLibraryItemDto MapClause(ClauseLibraryItem c) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Content = c.Content,
        ContentEn = c.ContentEn,
        Category = c.Category,
        PracticeArea = c.PracticeArea,
        RiskLevel = c.RiskLevel,
        Commentary = c.Commentary,
        LegalReferences = c.LegalReferences,
        ApplicableLaw = c.ApplicableLaw,
        IsMandatory = c.IsMandatory,
        Tags = c.Tags,
        CreatedAt = c.CreatedAt
    };

    private static DocumentSessionDetailDto MapSessionDetail(DocumentSession s) => new()
    {
        Id = s.Id,
        TemplateId = s.TemplateId,
        TemplateName = s.Template.Name,
        Category = s.Template.Category,
        Language = s.Language,
        Status = s.Status,
        CurrentFieldIndex = s.CurrentFieldIndex,
        ProgressPercent = s.ProgressPercent,
        Title = s.Title,
        Notes = s.Notes,
        CaseId = s.CaseId,
        ClientId = s.ClientId,
        CreatedAt = s.CreatedAt,
        CompletedAt = s.CompletedAt,
        Fields = s.Template.Fields.Where(f => !f.IsDeleted).OrderBy(f => f.SortOrder).Select(MapField).ToList(),
        Answers = s.Answers.Select(a => new DocumentSessionAnswerDto
        {
            Id = a.Id,
            FieldId = a.FieldId,
            FieldKey = a.Field?.FieldKey ?? "",
            Value = a.Value
        }).ToList()
    };

    private static GeneratedDocumentDetailDto MapGeneratedDocumentDetail(GeneratedDocument g) => new()
    {
        Id = g.Id,
        SessionId = g.SessionId,
        Title = g.Title,
        ContentHtml = g.ContentHtml,
        ContentHtmlEn = g.ContentHtmlEn,
        Category = g.Category,
        Language = g.Language,
        Version = g.Version,
        ReadabilityScore = g.ReadabilityScore,
        QualityCheckResultsJson = g.QualityCheckResultsJson,
        FieldValuesJson = g.FieldValuesJson,
        ExportedFilePath = g.ExportedFilePath,
        CreatedAt = g.CreatedAt
    };
}
