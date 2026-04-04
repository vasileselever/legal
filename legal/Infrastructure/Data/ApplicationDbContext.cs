using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Entities.Billing;
using LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LegalRO.CaseManagement.Infrastructure.Data;

/// <summary>
/// Main database context for LegalRO Case Management System
/// </summary>
public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets
    public DbSet<Firm> Firms => Set<Firm>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Deadline> Deadlines => Set<Deadline>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<CaseUser> CaseUsers => Set<CaseUser>();

    // Lead Management DbSets
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadConversation> LeadConversations => Set<LeadConversation>();
    public DbSet<LeadDocument> LeadDocuments => Set<LeadDocument>();
    public DbSet<Consultation> Consultations => Set<Consultation>();
    public DbSet<ConflictCheck> ConflictChecks => Set<ConflictCheck>();
    public DbSet<LeadActivity> LeadActivities => Set<LeadActivity>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<CampaignMessage> CampaignMessages => Set<CampaignMessage>();
    public DbSet<CampaignEnrollment> CampaignEnrollments => Set<CampaignEnrollment>();
    public DbSet<IntakeForm> IntakeForms => Set<IntakeForm>();
    public DbSet<IntakeFormSubmission> IntakeFormSubmissions => Set<IntakeFormSubmission>();
    public DbSet<LegalResearch> LegalResearches => Set<LegalResearch>();

    // Document Automation DbSets
    public DbSet<DocumentTemplate> DocumentTemplates => Set<DocumentTemplate>();
    public DbSet<DocumentTemplateField> DocumentTemplateFields => Set<DocumentTemplateField>();
    public DbSet<ClauseLibraryItem> ClauseLibraryItems => Set<ClauseLibraryItem>();
    public DbSet<TemplateClauseMapping> TemplateClauseMappings => Set<TemplateClauseMapping>();
    public DbSet<DocumentSession> DocumentSessions => Set<DocumentSession>();
    public DbSet<DocumentSessionAnswer> DocumentSessionAnswers => Set<DocumentSessionAnswer>();
    public DbSet<GeneratedDocument> GeneratedDocuments => Set<GeneratedDocument>();

    // Billing & Financial Management DbSets
    public DbSet<BillingRate> BillingRates => Set<BillingRate>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<TrustAccount> TrustAccounts => Set<TrustAccount>();
    public DbSet<TrustTransaction> TrustTransactions => Set<TrustTransaction>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure table names with schema
        builder.HasDefaultSchema("legal");

        // Firm configuration
        builder.Entity<Firm>(entity =>
        {
            entity.ToTable("Firms");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.HasIndex(e => e.FiscalCode).IsUnique().HasFilter("[FiscalCode] IS NOT NULL");
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // User configuration
        builder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.Firm)
                .WithMany(f => f.Users)
                .HasForeignKey(e => e.FirmId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.Email);
        });

        // Client configuration
        builder.Entity<Client>(entity =>
        {
            entity.ToTable("Clients");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            
            entity.HasOne(e => e.Firm)
                .WithMany(f => f.Clients)
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => new { e.FirmId, e.Email });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Case configuration
        builder.Entity<Case>(entity =>
        {
            entity.ToTable("Cases");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CaseNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CaseValue).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Firm)
                .WithMany(f => f.Cases)
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany(c => c.Cases)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ResponsibleLawyer)
                .WithMany(u => u.ResponsibleCases)
                .HasForeignKey(e => e.ResponsibleLawyerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.FirmId, e.CaseNumber }).IsUnique();
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.ResponsibleLawyerId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.PracticeArea);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // CaseUser (many-to-many) configuration
        builder.Entity<CaseUser>(entity =>
        {
            entity.ToTable("CaseUsers");
            entity.HasKey(e => new { e.CaseId, e.UserId });

            entity.HasOne(e => e.Case)
                .WithMany(c => c.AssignedUsers)
                .HasForeignKey(e => e.CaseId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.CaseAssignments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Document configuration
        builder.Entity<Document>(entity =>
        {
            entity.ToTable("Documents");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            
            entity.HasOne(e => e.Case)
                .WithMany(c => c.Documents)
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Uploader)
                .WithMany(u => u.UploadedDocuments)
                .HasForeignKey(e => e.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ParentDocument)
                .WithMany(d => d.ChildVersions)
                .HasForeignKey(e => e.ParentDocumentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.CaseId);
            entity.HasIndex(e => e.UploadedBy);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Deadline configuration
        builder.Entity<Deadline>(entity =>
        {
            entity.ToTable("Deadlines");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            
            entity.HasOne(e => e.Case)
                .WithMany(c => c.Deadlines)
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.AssignedUser)
                .WithMany()
                .HasForeignKey(e => e.AssignedTo)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.CaseId);
            entity.HasIndex(e => e.AssignedTo);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => new { e.DueDate, e.IsCompleted });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // TaskItem configuration
        builder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            
            entity.HasOne(e => e.Case)
                .WithMany(c => c.Tasks)
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.AssignedUser)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(e => e.AssignedTo)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.CaseId);
            entity.HasIndex(e => e.AssignedTo);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.AssignedTo, e.Status });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // TaskComment configuration
        builder.Entity<TaskComment>(entity =>
        {
            entity.ToTable("TaskComments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();

            entity.HasOne(e => e.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(e => e.TaskId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.TaskId);
        });

        // Note configuration
        builder.Entity<Note>(entity =>
        {
            entity.ToTable("Notes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
            
            entity.HasOne(e => e.Case)
                .WithMany(c => c.Notes)
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Notes)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.CaseId);
            entity.HasIndex(e => new { e.CaseId, e.IsPinned });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Activity configuration
        builder.Entity<Activity>(entity =>
        {
            entity.ToTable("Activities");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActivityType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.Case)
                .WithMany(c => c.Activities)
                .HasForeignKey(e => e.CaseId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.CaseId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.CaseId, e.CreatedAt });
        });

        // AuditLog configuration
        builder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
        });

        // Lead configuration
        builder.Entity<Lead>(entity =>
        {
            entity.ToTable("Leads");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Description).IsRequired();
            
            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.AssignedLawyer)
                .WithMany()
                .HasForeignKey(e => e.AssignedTo)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ConvertedClient)
                .WithMany()
                .HasForeignKey(e => e.ConvertedToClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Phone);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Source);
            entity.HasIndex(e => e.PracticeArea);
            entity.HasIndex(e => e.AssignedTo);
            entity.HasIndex(e => e.Score);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // LeadConversation configuration
        builder.Entity<LeadConversation>(entity =>
        {
            entity.ToTable("LeadConversations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired();

            entity.HasOne(e => e.Lead)
                .WithMany(l => l.Conversations)
                .HasForeignKey(e => e.LeadId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.LeadId);
            entity.HasIndex(e => e.MessageTimestamp);
            entity.HasIndex(e => new { e.LeadId, e.MessageTimestamp });
        });

        // LeadDocument configuration
        builder.Entity<LeadDocument>(entity =>
        {
            entity.ToTable("LeadDocuments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.Lead)
                .WithMany(l => l.Documents)
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.LeadId);
            entity.HasIndex(e => e.GeneratedDocumentId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Consultation configuration
        builder.Entity<Consultation>(entity =>
        {
            entity.ToTable("Consultations");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Lead)
                .WithMany(l => l.Consultations)
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Lawyer)
                .WithMany()
                .HasForeignKey(e => e.LawyerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.LeadId);
            entity.HasIndex(e => e.LawyerId);
            entity.HasIndex(e => e.ScheduledAt);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.LawyerId, e.ScheduledAt });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ConflictCheck configuration
        builder.Entity<ConflictCheck>(entity =>
        {
            entity.ToTable("ConflictChecks");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Lead)
                .WithMany(l => l.ConflictChecks)
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ConflictingCase)
                .WithMany()
                .HasForeignKey(e => e.ConflictingCaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ConflictingClient)
                .WithMany()
                .HasForeignKey(e => e.ConflictingClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ResolvedByUser)
                .WithMany()
                .HasForeignKey(e => e.ResolvedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.LeadId);
            entity.HasIndex(e => e.Status);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // LeadActivity configuration
        builder.Entity<LeadActivity>(entity =>
        {
            entity.ToTable("LeadActivities");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActivityType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.Lead)
                .WithMany(l => l.Activities)
                .HasForeignKey(e => e.LeadId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.LeadId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.LeadId, e.CreatedAt });
        });

        // Campaign configuration
        builder.Entity<Campaign>(entity =>
        {
            entity.ToTable("Campaigns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            
            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.Status);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // CampaignMessage configuration
        builder.Entity<CampaignMessage>(entity =>
        {
            entity.ToTable("CampaignMessages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).HasMaxLength(200);
            entity.Property(e => e.Body).IsRequired();
            
            entity.HasOne(e => e.Campaign)
                .WithMany(c => c.Messages)
                .HasForeignKey(e => e.CampaignId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CampaignId);
            entity.HasIndex(e => e.StepNumber);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // CampaignEnrollment configuration
        builder.Entity<CampaignEnrollment>(entity =>
        {
            entity.ToTable("CampaignEnrollments");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Campaign)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CampaignId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Lead)
                .WithMany()
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.CampaignId, e.LeadId }).IsUnique();
            entity.HasIndex(e => e.NextMessageDue);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // IntakeForm configuration
        builder.Entity<IntakeForm>(entity =>
        {
            entity.ToTable("IntakeForms");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.FormFieldsJson).IsRequired();
            
            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.IsActive);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // IntakeFormSubmission configuration
        builder.Entity<IntakeFormSubmission>(entity =>
        {
            entity.ToTable("IntakeFormSubmissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FormDataJson).IsRequired();
            
            entity.HasOne(e => e.IntakeForm)
                .WithMany(f => f.Submissions)
                .HasForeignKey(e => e.IntakeFormId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Lead)
                .WithMany()
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.IntakeFormId);
            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.LeadId);
            entity.HasIndex(e => e.SubmittedAt);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // LegalResearch configuration
        builder.Entity<LegalResearch>(entity =>
        {
            entity.ToTable("LegalResearches");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Query).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.Answer).IsRequired();
            entity.Property(e => e.SourcesJson).IsRequired();
            entity.Property(e => e.ModelUsed).HasMaxLength(100);
            entity.Property(e => e.Title).HasMaxLength(200);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.FirmId, e.IsBookmarked });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Document Automation Configurations
        builder.Entity<DocumentTemplate>(entity =>
        {
            entity.ToTable("DocumentTemplates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.BodyTemplate).IsRequired();
            entity.Property(e => e.Tags).HasMaxLength(500);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.PracticeArea);
            entity.HasIndex(e => e.IsActive);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        builder.Entity<DocumentTemplateField>(entity =>
        {
            entity.ToTable("DocumentTemplateFields");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FieldKey).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Label).IsRequired().HasMaxLength(300);
            entity.Property(e => e.LabelEn).HasMaxLength(300);
            entity.Property(e => e.HelpText).HasMaxLength(1000);
            entity.Property(e => e.Section).HasMaxLength(100);
            entity.Property(e => e.DefaultValue).HasMaxLength(1000);
            entity.Property(e => e.ValidationPattern).HasMaxLength(500);
            entity.Property(e => e.ValidationMessage).HasMaxLength(500);

            entity.HasOne(e => e.Template)
                .WithMany(t => t.Fields)
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.TemplateId);
            entity.HasIndex(e => new { e.TemplateId, e.FieldKey }).IsUnique();
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        builder.Entity<ClauseLibraryItem>(entity =>
        {
            entity.ToTable("ClauseLibraryItems");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.Commentary).HasMaxLength(2000);
            entity.Property(e => e.LegalReferences).HasMaxLength(1000);
            entity.Property(e => e.ApplicableLaw).HasMaxLength(500);
            entity.Property(e => e.Tags).HasMaxLength(500);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.PracticeArea);
            entity.HasIndex(e => e.RiskLevel);
            entity.HasIndex(e => e.IsMandatory);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        builder.Entity<TemplateClauseMapping>(entity =>
        {
            entity.ToTable("TemplateClauseMappings");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Template)
                .WithMany(t => t.ClauseMappings)
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Clause)
                .WithMany(c => c.TemplateMappings)
                .HasForeignKey(e => e.ClauseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.TemplateId);
            entity.HasIndex(e => e.ClauseId);
            entity.HasIndex(e => new { e.TemplateId, e.ClauseId });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        builder.Entity<DocumentSession>(entity =>
        {
            entity.ToTable("DocumentSessions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(300);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Template)
                .WithMany(t => t.Sessions)
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TemplateId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.FirmId, e.UserId, e.Status });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        builder.Entity<DocumentSessionAnswer>(entity =>
        {
            entity.ToTable("DocumentSessionAnswers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Value).IsRequired();

            entity.HasOne(e => e.Session)
                .WithMany(s => s.Answers)
                .HasForeignKey(e => e.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Field)
                .WithMany()
                .HasForeignKey(e => e.FieldId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.SessionId);
            entity.HasIndex(e => new { e.SessionId, e.FieldId }).IsUnique();
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        builder.Entity<GeneratedDocument>(entity =>
        {
            entity.ToTable("GeneratedDocuments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.Property(e => e.ContentHtml).IsRequired();
            entity.Property(e => e.ExportedFilePath).HasMaxLength(500);
            entity.Property(e => e.ExportedMimeType).HasMaxLength(100);
            entity.Property(e => e.FieldValuesJson).IsRequired();

            entity.HasOne(e => e.Session)
                .WithMany(s => s.GeneratedDocuments)
                .HasForeignKey(e => e.SessionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.GeneratedByUser)
                .WithMany()
                .HasForeignKey(e => e.GeneratedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.SessionId);
            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.FirmId, e.Category });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ?? Billing & Financial Management Configurations ??????????

        // BillingRate
        builder.Entity<BillingRate>(entity =>
        {
            entity.ToTable("BillingRates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.FirmId, e.UserId, e.ClientId, e.CaseId });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // TimeEntry
        builder.Entity<TimeEntry>(entity =>
        {
            entity.ToTable("TimeEntries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DurationHours).HasColumnType("decimal(8,2)");
            entity.Property(e => e.HourlyRate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.ActivityCode).HasMaxLength(50);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Lead)
                .WithMany()
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.InvoiceLineItem)
                .WithMany()
                .HasForeignKey(e => e.InvoiceLineItemId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CaseId);
            entity.HasIndex(e => e.WorkDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.FirmId, e.UserId, e.WorkDate });
            entity.HasIndex(e => new { e.FirmId, e.CaseId, e.Status });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Expense
        builder.Entity<Expense>(entity =>
        {
            entity.ToTable("Expenses");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MarkupPercent).HasColumnType("decimal(5,2)");
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.ReceiptFilePath).HasMaxLength(500);
            entity.Property(e => e.Vendor).HasMaxLength(200);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Lead)
                .WithMany()
                .HasForeignKey(e => e.LeadId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.InvoiceLineItem)
                .WithMany()
                .HasForeignKey(e => e.InvoiceLineItemId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.CaseId);
            entity.HasIndex(e => e.LeadId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ExpenseDate);
            entity.HasIndex(e => new { e.FirmId, e.Status });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Invoice
        builder.Entity<Invoice>(entity =>
        {
            entity.ToTable("Invoices");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InvoiceNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
            entity.Property(e => e.VatPercent).HasColumnType("decimal(5,2)");
            entity.Property(e => e.VatAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PaidAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.WriteOffAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.EFacturaId).HasMaxLength(100);
            entity.Property(e => e.PaymentLinkToken).HasMaxLength(100);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.FirmId, e.InvoiceNumber }).IsUnique();
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.CaseId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.InvoiceDate);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => new { e.FirmId, e.Status });
            entity.HasIndex(e => new { e.FirmId, e.ClientId, e.Status });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // InvoiceLineItem
        builder.Entity<InvoiceLineItem>(entity =>
        {
            entity.ToTable("InvoiceLineItems");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Quantity).HasColumnType("decimal(10,2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.LineType).IsRequired().HasMaxLength(50);

            entity.HasOne(e => e.Invoice)
                .WithMany(i => i.LineItems)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TimeEntry)
                .WithMany()
                .HasForeignKey(e => e.TimeEntryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Expense)
                .WithMany()
                .HasForeignKey(e => e.ExpenseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.InvoiceId);
            entity.HasIndex(e => e.TimeEntryId);
            entity.HasIndex(e => e.ExpenseId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Payment
        builder.Entity<Payment>(entity =>
        {
            entity.ToTable("Payments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TransactionReference).HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(1000);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Invoice)
                .WithMany(i => i.Payments)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.TrustTransaction)
                .WithMany()
                .HasForeignKey(e => e.TrustTransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.InvoiceId);
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.PaymentDate);
            entity.HasIndex(e => new { e.FirmId, e.PaymentDate });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // TrustAccount
        builder.Entity<TrustAccount>(entity =>
        {
            entity.ToTable("TrustAccounts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AccountReference).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MinimumBalance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Notes).HasMaxLength(1000);

            entity.HasOne(e => e.Firm)
                .WithMany()
                .HasForeignKey(e => e.FirmId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.FirmId);
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => new { e.FirmId, e.AccountReference }).IsUnique();
            entity.HasIndex(e => new { e.FirmId, e.IsActive });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // TrustTransaction
        builder.Entity<TrustTransaction>(entity =>
        {
            entity.ToTable("TrustTransactions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.RunningBalance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Reference).HasMaxLength(200);

            entity.HasOne(e => e.TrustAccount)
                .WithMany(a => a.Transactions)
                .HasForeignKey(e => e.TrustAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Payment)
                .WithMany()
                .HasForeignKey(e => e.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PerformedByUser)
                .WithMany()
                .HasForeignKey(e => e.PerformedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.TrustAccountId);
            entity.HasIndex(e => e.TransactionDate);
            entity.HasIndex(e => new { e.TrustAccountId, e.TransactionDate });
            entity.HasQueryFilter(e => !e.IsDeleted);
        });
    }

    /// <summary>
    /// Override SaveChanges to automatically set audit fields
    /// </summary>
    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    /// <summary>
    /// Override SaveChangesAsync to automatically set audit fields
    /// </summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Common.BaseEntity && 
                       (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (Domain.Common.BaseEntity)entry.Entity;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
