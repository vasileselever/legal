using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRO.CaseManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadIdToTimeEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "CaseId",
                schema: "legal",
                table: "TimeEntries",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "LeadId",
                schema: "legal",
                table: "TimeEntries",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_LeadId",
                schema: "legal",
                table: "TimeEntries",
                column: "LeadId");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeEntries_Leads_LeadId",
                schema: "legal",
                table: "TimeEntries",
                column: "LeadId",
                principalSchema: "legal",
                principalTable: "Leads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeEntries_Leads_LeadId",
                schema: "legal",
                table: "TimeEntries");

            migrationBuilder.DropIndex(
                name: "IX_TimeEntries_LeadId",
                schema: "legal",
                table: "TimeEntries");

            migrationBuilder.DropColumn(
                name: "LeadId",
                schema: "legal",
                table: "TimeEntries");

            migrationBuilder.AlterColumn<Guid>(
                name: "CaseId",
                schema: "legal",
                table: "TimeEntries",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }
    }
}
