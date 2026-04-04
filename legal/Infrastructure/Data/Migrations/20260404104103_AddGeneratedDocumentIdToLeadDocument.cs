using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRO.CaseManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGeneratedDocumentIdToLeadDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "GeneratedDocumentId",
                schema: "legal",
                table: "LeadDocuments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LeadDocuments_GeneratedDocumentId",
                schema: "legal",
                table: "LeadDocuments",
                column: "GeneratedDocumentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LeadDocuments_GeneratedDocumentId",
                schema: "legal",
                table: "LeadDocuments");

            migrationBuilder.DropColumn(
                name: "GeneratedDocumentId",
                schema: "legal",
                table: "LeadDocuments");
        }
    }
}
