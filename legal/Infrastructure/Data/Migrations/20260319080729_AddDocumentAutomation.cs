using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRO.CaseManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentAutomation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClauseLibraryItems",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<int>(type: "int", nullable: false),
                    PracticeArea = table.Column<int>(type: "int", nullable: false),
                    RiskLevel = table.Column<int>(type: "int", nullable: false),
                    Commentary = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    LegalReferences = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ApplicableLaw = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsMandatory = table.Column<bool>(type: "bit", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClauseLibraryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClauseLibraryItems_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocumentTemplates",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Category = table.Column<int>(type: "int", nullable: false),
                    PracticeArea = table.Column<int>(type: "int", nullable: false),
                    Language = table.Column<int>(type: "int", nullable: false),
                    BodyTemplate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BodyTemplateEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsSystemTemplate = table.Column<bool>(type: "bit", nullable: false),
                    EstimatedMinutes = table.Column<int>(type: "int", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentTemplates_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocumentSessions",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Language = table.Column<int>(type: "int", nullable: false),
                    CurrentFieldIndex = table.Column<int>(type: "int", nullable: false),
                    ProgressPercent = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentSessions_Cases_CaseId",
                        column: x => x.CaseId,
                        principalSchema: "legal",
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentSessions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalSchema: "legal",
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentSessions_DocumentTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "legal",
                        principalTable: "DocumentTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentSessions_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentSessions_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocumentTemplateFields",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FieldKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    LabelEn = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    HelpText = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FieldType = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Section = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    DefaultValue = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    OptionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConditionJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValidationPattern = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ValidationMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentTemplateFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentTemplateFields_DocumentTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "legal",
                        principalTable: "DocumentTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TemplateClauseMappings",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClauseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    ConditionJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateClauseMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateClauseMappings_ClauseLibraryItems_ClauseId",
                        column: x => x.ClauseId,
                        principalSchema: "legal",
                        principalTable: "ClauseLibraryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TemplateClauseMappings_DocumentTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "legal",
                        principalTable: "DocumentTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GeneratedDocuments",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GeneratedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    ContentHtml = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentHtmlEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Language = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    ExportedFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ExportedMimeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    FieldValuesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QualityCheckResultsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReadabilityScore = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneratedDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GeneratedDocuments_DocumentSessions_SessionId",
                        column: x => x.SessionId,
                        principalSchema: "legal",
                        principalTable: "DocumentSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GeneratedDocuments_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GeneratedDocuments_Users_GeneratedByUserId",
                        column: x => x.GeneratedByUserId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocumentSessionAnswers",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FieldId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentSessionAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentSessionAnswers_DocumentSessions_SessionId",
                        column: x => x.SessionId,
                        principalSchema: "legal",
                        principalTable: "DocumentSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentSessionAnswers_DocumentTemplateFields_FieldId",
                        column: x => x.FieldId,
                        principalSchema: "legal",
                        principalTable: "DocumentTemplateFields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClauseLibraryItems_Category",
                schema: "legal",
                table: "ClauseLibraryItems",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_ClauseLibraryItems_FirmId",
                schema: "legal",
                table: "ClauseLibraryItems",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_ClauseLibraryItems_IsMandatory",
                schema: "legal",
                table: "ClauseLibraryItems",
                column: "IsMandatory");

            migrationBuilder.CreateIndex(
                name: "IX_ClauseLibraryItems_PracticeArea",
                schema: "legal",
                table: "ClauseLibraryItems",
                column: "PracticeArea");

            migrationBuilder.CreateIndex(
                name: "IX_ClauseLibraryItems_RiskLevel",
                schema: "legal",
                table: "ClauseLibraryItems",
                column: "RiskLevel");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessionAnswers_FieldId",
                schema: "legal",
                table: "DocumentSessionAnswers",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessionAnswers_SessionId",
                schema: "legal",
                table: "DocumentSessionAnswers",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessionAnswers_SessionId_FieldId",
                schema: "legal",
                table: "DocumentSessionAnswers",
                columns: new[] { "SessionId", "FieldId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessions_CaseId",
                schema: "legal",
                table: "DocumentSessions",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessions_ClientId",
                schema: "legal",
                table: "DocumentSessions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessions_FirmId",
                schema: "legal",
                table: "DocumentSessions",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessions_FirmId_UserId_Status",
                schema: "legal",
                table: "DocumentSessions",
                columns: new[] { "FirmId", "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessions_Status",
                schema: "legal",
                table: "DocumentSessions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessions_TemplateId",
                schema: "legal",
                table: "DocumentSessions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSessions_UserId",
                schema: "legal",
                table: "DocumentSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplateFields_TemplateId",
                schema: "legal",
                table: "DocumentTemplateFields",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplateFields_TemplateId_FieldKey",
                schema: "legal",
                table: "DocumentTemplateFields",
                columns: new[] { "TemplateId", "FieldKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_Category",
                schema: "legal",
                table: "DocumentTemplates",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_FirmId",
                schema: "legal",
                table: "DocumentTemplates",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_IsActive",
                schema: "legal",
                table: "DocumentTemplates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_PracticeArea",
                schema: "legal",
                table: "DocumentTemplates",
                column: "PracticeArea");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_Category",
                schema: "legal",
                table: "GeneratedDocuments",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_CreatedAt",
                schema: "legal",
                table: "GeneratedDocuments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_FirmId",
                schema: "legal",
                table: "GeneratedDocuments",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_FirmId_Category",
                schema: "legal",
                table: "GeneratedDocuments",
                columns: new[] { "FirmId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_GeneratedByUserId",
                schema: "legal",
                table: "GeneratedDocuments",
                column: "GeneratedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_SessionId",
                schema: "legal",
                table: "GeneratedDocuments",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateClauseMappings_ClauseId",
                schema: "legal",
                table: "TemplateClauseMappings",
                column: "ClauseId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateClauseMappings_TemplateId",
                schema: "legal",
                table: "TemplateClauseMappings",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateClauseMappings_TemplateId_ClauseId",
                schema: "legal",
                table: "TemplateClauseMappings",
                columns: new[] { "TemplateId", "ClauseId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentSessionAnswers",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "GeneratedDocuments",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "TemplateClauseMappings",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "DocumentTemplateFields",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "DocumentSessions",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "ClauseLibraryItems",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "DocumentTemplates",
                schema: "legal");
        }
    }
}
