using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRO.CaseManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLegalResearch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LegalResearches",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Query = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PracticeArea = table.Column<int>(type: "int", nullable: true),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SourcesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConfidenceScore = table.Column<int>(type: "int", nullable: false),
                    ProcessingMs = table.Column<int>(type: "int", nullable: false),
                    ModelUsed = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsBookmarked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LegalResearches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LegalResearches_Cases_CaseId",
                        column: x => x.CaseId,
                        principalSchema: "legal",
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LegalResearches_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LegalResearches_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LegalResearches_CaseId",
                schema: "legal",
                table: "LegalResearches",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_LegalResearches_CreatedAt",
                schema: "legal",
                table: "LegalResearches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LegalResearches_FirmId",
                schema: "legal",
                table: "LegalResearches",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_LegalResearches_FirmId_IsBookmarked",
                schema: "legal",
                table: "LegalResearches",
                columns: new[] { "FirmId", "IsBookmarked" });

            migrationBuilder.CreateIndex(
                name: "IX_LegalResearches_UserId",
                schema: "legal",
                table: "LegalResearches",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LegalResearches",
                schema: "legal");
        }
    }
}
