using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRO.CaseManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadIdToExpense : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Expenses_FirmId_CaseId_Status",
                schema: "legal",
                table: "Expenses");

            migrationBuilder.AlterColumn<Guid>(
                name: "CaseId",
                schema: "legal",
                table: "Expenses",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "LeadId",
                schema: "legal",
                table: "Expenses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_FirmId_Status",
                schema: "legal",
                table: "Expenses",
                columns: new[] { "FirmId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_LeadId",
                schema: "legal",
                table: "Expenses",
                column: "LeadId");

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_Leads_LeadId",
                schema: "legal",
                table: "Expenses",
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
                name: "FK_Expenses_Leads_LeadId",
                schema: "legal",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_FirmId_Status",
                schema: "legal",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_LeadId",
                schema: "legal",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "LeadId",
                schema: "legal",
                table: "Expenses");

            migrationBuilder.AlterColumn<Guid>(
                name: "CaseId",
                schema: "legal",
                table: "Expenses",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_FirmId_CaseId_Status",
                schema: "legal",
                table: "Expenses",
                columns: new[] { "FirmId", "CaseId", "Status" });
        }
    }
}
