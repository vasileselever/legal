using Microsoft.EntityFrameworkCore.Migrations;

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRO.CaseManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadFiscalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Note: Cod and UM on InvoiceLineItems are already added by
            // 20260408071233_AddInvoiceLineItemCodUM — not repeated here.

            migrationBuilder.AddColumn<string>(
                name: "Bank",
                schema: "legal",
                table: "Firms",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccount",
                schema: "legal",
                table: "Firms",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationCode",
                schema: "legal",
                table: "Firms",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bank",
                schema: "legal",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccount",
                schema: "legal",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationCode",
                schema: "legal",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCorporate",
                schema: "legal",
                table: "Leads",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                schema: "legal",
                table: "Leads",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                schema: "legal",
                table: "Leads",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FiscalCode",
                schema: "legal",
                table: "Leads",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationCode",
                schema: "legal",
                table: "Leads",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bank",
                schema: "legal",
                table: "Leads",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccount",
                schema: "legal",
                table: "Leads",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Note: Cod and UM on InvoiceLineItems are handled by
            // 20260408071233_AddInvoiceLineItemCodUM — not dropped here.

            migrationBuilder.DropColumn(
                name: "Bank",
                schema: "legal",
                table: "Firms");

            migrationBuilder.DropColumn(
                name: "BankAccount",
                schema: "legal",
                table: "Firms");

            migrationBuilder.DropColumn(
                name: "RegistrationCode",
                schema: "legal",
                table: "Firms");

            migrationBuilder.DropColumn(
                name: "Bank",
                schema: "legal",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "BankAccount",
                schema: "legal",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "RegistrationCode",
                schema: "legal",
                table: "Clients");

            migrationBuilder.DropColumn(name: "IsCorporate",      schema: "legal", table: "Leads");
            migrationBuilder.DropColumn(name: "Address",          schema: "legal", table: "Leads");
            migrationBuilder.DropColumn(name: "City",             schema: "legal", table: "Leads");
            migrationBuilder.DropColumn(name: "FiscalCode",       schema: "legal", table: "Leads");
            migrationBuilder.DropColumn(name: "RegistrationCode", schema: "legal", table: "Leads");
            migrationBuilder.DropColumn(name: "Bank",             schema: "legal", table: "Leads");
            migrationBuilder.DropColumn(name: "BankAccount",      schema: "legal", table: "Leads");
        }
    }
}
