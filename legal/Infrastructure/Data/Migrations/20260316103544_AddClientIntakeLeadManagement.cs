using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRO.CaseManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddClientIntakeLeadManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Campaigns",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TriggerEvent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PracticeAreaFilter = table.Column<int>(type: "int", nullable: true),
                    TotalSent = table.Column<int>(type: "int", nullable: false),
                    TotalOpened = table.Column<int>(type: "int", nullable: false),
                    TotalClicked = table.Column<int>(type: "int", nullable: false),
                    TotalConverted = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "IntakeForms",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PracticeArea = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    FormFieldsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConditionalLogicJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomCss = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThankYouMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AutoResponderTemplate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalSubmissions = table.Column<int>(type: "int", nullable: false),
                    TotalConversions = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntakeForms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IntakeForms_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Leads",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Source = table.Column<int>(type: "int", nullable: false),
                    SourceDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    PracticeArea = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Urgency = table.Column<int>(type: "int", nullable: false),
                    BudgetRange = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredContactMethod = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignedTo = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConvertedToClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConvertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomFieldsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConsentToMarketing = table.Column<bool>(type: "bit", nullable: false),
                    ConsentToDataProcessing = table.Column<bool>(type: "bit", nullable: false),
                    ConsentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leads_Clients_ConvertedToClientId",
                        column: x => x.ConvertedToClientId,
                        principalSchema: "legal",
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Leads_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Leads_Users_AssignedTo",
                        column: x => x.AssignedTo,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CampaignMessages",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CampaignId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepNumber = table.Column<int>(type: "int", nullable: false),
                    DelayDays = table.Column<int>(type: "int", nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TemplateVariables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SentCount = table.Column<int>(type: "int", nullable: false),
                    OpenCount = table.Column<int>(type: "int", nullable: false),
                    ClickCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignMessages_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "legal",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CampaignEnrollments",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CampaignId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentStep = table.Column<int>(type: "int", nullable: false),
                    LastMessageSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextMessageDue = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    IsUnsubscribed = table.Column<bool>(type: "bit", nullable: false),
                    UnsubscribedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignEnrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignEnrollments_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "legal",
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CampaignEnrollments_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "legal",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConflictChecks",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OpposingPartyName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ConflictType = table.Column<int>(type: "int", nullable: true),
                    ConflictDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConflictingCaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConflictingClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Resolution = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WaiverRequested = table.Column<bool>(type: "bit", nullable: false),
                    WaiverObtained = table.Column<bool>(type: "bit", nullable: false),
                    WaiverDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WaiverDocumentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConflictChecks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConflictChecks_Cases_ConflictingCaseId",
                        column: x => x.ConflictingCaseId,
                        principalSchema: "legal",
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConflictChecks_Clients_ConflictingClientId",
                        column: x => x.ConflictingClientId,
                        principalSchema: "legal",
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConflictChecks_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "legal",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConflictChecks_Users_ResolvedBy",
                        column: x => x.ResolvedBy,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Consultations",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    VideoMeetingLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Reminder24HoursSent = table.Column<bool>(type: "bit", nullable: false),
                    Reminder1HourSent = table.Column<bool>(type: "bit", nullable: false),
                    PreparationNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConsultationNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consultations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Consultations_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "legal",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Consultations_Users_LawyerId",
                        column: x => x.LawyerId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "IntakeFormSubmissions",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IntakeFormId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FormDataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Referrer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntakeFormSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IntakeFormSubmissions_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IntakeFormSubmissions_IntakeForms_IntakeFormId",
                        column: x => x.IntakeFormId,
                        principalSchema: "legal",
                        principalTable: "IntakeForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IntakeFormSubmissions_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "legal",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadActivities",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ActivityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadActivities_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "legal",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadActivities_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeadConversations",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sender = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsFromLead = table.Column<bool>(type: "bit", nullable: false),
                    MessageTimestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MessageId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadConversations_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "legal",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadDocuments",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadDocuments_Leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "legal",
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CampaignEnrollments_CampaignId_LeadId",
                schema: "legal",
                table: "CampaignEnrollments",
                columns: new[] { "CampaignId", "LeadId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CampaignEnrollments_LeadId",
                schema: "legal",
                table: "CampaignEnrollments",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignEnrollments_NextMessageDue",
                schema: "legal",
                table: "CampaignEnrollments",
                column: "NextMessageDue");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMessages_CampaignId",
                schema: "legal",
                table: "CampaignMessages",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignMessages_StepNumber",
                schema: "legal",
                table: "CampaignMessages",
                column: "StepNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_FirmId",
                schema: "legal",
                table: "Campaigns",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_Status",
                schema: "legal",
                table: "Campaigns",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ConflictChecks_ConflictingCaseId",
                schema: "legal",
                table: "ConflictChecks",
                column: "ConflictingCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_ConflictChecks_ConflictingClientId",
                schema: "legal",
                table: "ConflictChecks",
                column: "ConflictingClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ConflictChecks_LeadId",
                schema: "legal",
                table: "ConflictChecks",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_ConflictChecks_ResolvedBy",
                schema: "legal",
                table: "ConflictChecks",
                column: "ResolvedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ConflictChecks_Status",
                schema: "legal",
                table: "ConflictChecks",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_LawyerId",
                schema: "legal",
                table: "Consultations",
                column: "LawyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_LawyerId_ScheduledAt",
                schema: "legal",
                table: "Consultations",
                columns: new[] { "LawyerId", "ScheduledAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_LeadId",
                schema: "legal",
                table: "Consultations",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_ScheduledAt",
                schema: "legal",
                table: "Consultations",
                column: "ScheduledAt");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_Status",
                schema: "legal",
                table: "Consultations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_IntakeForms_FirmId",
                schema: "legal",
                table: "IntakeForms",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_IntakeForms_IsActive",
                schema: "legal",
                table: "IntakeForms",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_IntakeFormSubmissions_FirmId",
                schema: "legal",
                table: "IntakeFormSubmissions",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_IntakeFormSubmissions_IntakeFormId",
                schema: "legal",
                table: "IntakeFormSubmissions",
                column: "IntakeFormId");

            migrationBuilder.CreateIndex(
                name: "IX_IntakeFormSubmissions_LeadId",
                schema: "legal",
                table: "IntakeFormSubmissions",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_IntakeFormSubmissions_SubmittedAt",
                schema: "legal",
                table: "IntakeFormSubmissions",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LeadActivities_CreatedAt",
                schema: "legal",
                table: "LeadActivities",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LeadActivities_LeadId",
                schema: "legal",
                table: "LeadActivities",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadActivities_LeadId_CreatedAt",
                schema: "legal",
                table: "LeadActivities",
                columns: new[] { "LeadId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_LeadActivities_UserId",
                schema: "legal",
                table: "LeadActivities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadConversations_LeadId",
                schema: "legal",
                table: "LeadConversations",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadConversations_LeadId_MessageTimestamp",
                schema: "legal",
                table: "LeadConversations",
                columns: new[] { "LeadId", "MessageTimestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_LeadConversations_MessageTimestamp",
                schema: "legal",
                table: "LeadConversations",
                column: "MessageTimestamp");

            migrationBuilder.CreateIndex(
                name: "IX_LeadDocuments_LeadId",
                schema: "legal",
                table: "LeadDocuments",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_AssignedTo",
                schema: "legal",
                table: "Leads",
                column: "AssignedTo");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_ConvertedToClientId",
                schema: "legal",
                table: "Leads",
                column: "ConvertedToClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_CreatedAt",
                schema: "legal",
                table: "Leads",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_Email",
                schema: "legal",
                table: "Leads",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_FirmId",
                schema: "legal",
                table: "Leads",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_Phone",
                schema: "legal",
                table: "Leads",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_PracticeArea",
                schema: "legal",
                table: "Leads",
                column: "PracticeArea");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_Score",
                schema: "legal",
                table: "Leads",
                column: "Score");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_Source",
                schema: "legal",
                table: "Leads",
                column: "Source");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_Status",
                schema: "legal",
                table: "Leads",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CampaignEnrollments",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "CampaignMessages",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "ConflictChecks",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "Consultations",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "IntakeFormSubmissions",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "LeadActivities",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "LeadConversations",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "LeadDocuments",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "Campaigns",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "IntakeForms",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "Leads",
                schema: "legal");
        }
    }
}
