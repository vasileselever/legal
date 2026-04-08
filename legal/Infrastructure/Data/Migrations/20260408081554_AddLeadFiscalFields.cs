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
            migrationBuilder.AddColumn<string>(
                name: "Cod",
                schema: "legal",
                table: "InvoiceLineItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UM",
                schema: "legal",
                table: "InvoiceLineItems",
                type: "nvarchar(max)",
                nullable: true);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cod",
                schema: "legal",
                table: "InvoiceLineItems");

            migrationBuilder.DropColumn(
                name: "UM",
                schema: "legal",
                table: "InvoiceLineItems");

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
        }
    }
}
