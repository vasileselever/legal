using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRO.CaseManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingFinancialManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillingRates",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingRates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillingRates_Cases_CaseId",
                        column: x => x.CaseId,
                        principalSchema: "legal",
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BillingRates_Clients_ClientId",
                        column: x => x.ClientId,
                        principalSchema: "legal",
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BillingRates_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BillingRates_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Currency = table.Column<int>(type: "int", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    VatPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    VatAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WriteOffAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PeriodStart = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PeriodEnd = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EFacturaId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentLinkToken = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoices_Cases_CaseId",
                        column: x => x.CaseId,
                        principalSchema: "legal",
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Invoices_Clients_ClientId",
                        column: x => x.ClientId,
                        principalSchema: "legal",
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Invoices_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TrustAccounts",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountReference = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Currency = table.Column<int>(type: "int", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MinimumBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrustAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrustAccounts_Clients_ClientId",
                        column: x => x.ClientId,
                        principalSchema: "legal",
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrustAccounts_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExpenseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<int>(type: "int", nullable: false),
                    MarkupPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsBillable = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ReceiptFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Vendor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    InvoiceLineItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Cases_CaseId",
                        column: x => x.CaseId,
                        principalSchema: "legal",
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Expenses_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Expenses_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceLineItems",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LineNumber = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TimeEntryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ExpenseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceLineItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceLineItems_Expenses_ExpenseId",
                        column: x => x.ExpenseId,
                        principalSchema: "legal",
                        principalTable: "Expenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvoiceLineItems_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "legal",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TimeEntries",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationHours = table.Column<decimal>(type: "decimal(8,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ActivityCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsBillable = table.Column<bool>(type: "bit", nullable: false),
                    HourlyRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    InvoiceLineItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TimerStart = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TimerStop = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeEntries_Cases_CaseId",
                        column: x => x.CaseId,
                        principalSchema: "legal",
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TimeEntries_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TimeEntries_InvoiceLineItems_InvoiceLineItemId",
                        column: x => x.InvoiceLineItemId,
                        principalSchema: "legal",
                        principalTable: "InvoiceLineItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TimeEntries_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<int>(type: "int", nullable: false),
                    Method = table.Column<int>(type: "int", nullable: false),
                    TransactionReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TrustTransactionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Clients_ClientId",
                        column: x => x.ClientId,
                        principalSchema: "legal",
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Firms_FirmId",
                        column: x => x.FirmId,
                        principalSchema: "legal",
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "legal",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TrustTransactions",
                schema: "legal",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TrustAccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TransactionType = table.Column<int>(type: "int", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RunningBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PaymentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PerformedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrustTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrustTransactions_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalSchema: "legal",
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrustTransactions_TrustAccounts_TrustAccountId",
                        column: x => x.TrustAccountId,
                        principalSchema: "legal",
                        principalTable: "TrustAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrustTransactions_Users_PerformedByUserId",
                        column: x => x.PerformedByUserId,
                        principalSchema: "legal",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillingRates_CaseId",
                schema: "legal",
                table: "BillingRates",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingRates_ClientId",
                schema: "legal",
                table: "BillingRates",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingRates_FirmId",
                schema: "legal",
                table: "BillingRates",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingRates_FirmId_UserId_ClientId_CaseId",
                schema: "legal",
                table: "BillingRates",
                columns: new[] { "FirmId", "UserId", "ClientId", "CaseId" });

            migrationBuilder.CreateIndex(
                name: "IX_BillingRates_UserId",
                schema: "legal",
                table: "BillingRates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CaseId",
                schema: "legal",
                table: "Expenses",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_ExpenseDate",
                schema: "legal",
                table: "Expenses",
                column: "ExpenseDate");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_FirmId",
                schema: "legal",
                table: "Expenses",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_FirmId_CaseId_Status",
                schema: "legal",
                table: "Expenses",
                columns: new[] { "FirmId", "CaseId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_InvoiceLineItemId",
                schema: "legal",
                table: "Expenses",
                column: "InvoiceLineItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_Status",
                schema: "legal",
                table: "Expenses",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_UserId",
                schema: "legal",
                table: "Expenses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_ExpenseId",
                schema: "legal",
                table: "InvoiceLineItems",
                column: "ExpenseId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_InvoiceId",
                schema: "legal",
                table: "InvoiceLineItems",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_TimeEntryId",
                schema: "legal",
                table: "InvoiceLineItems",
                column: "TimeEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CaseId",
                schema: "legal",
                table: "Invoices",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_ClientId",
                schema: "legal",
                table: "Invoices",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_DueDate",
                schema: "legal",
                table: "Invoices",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_FirmId_ClientId_Status",
                schema: "legal",
                table: "Invoices",
                columns: new[] { "FirmId", "ClientId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_FirmId_InvoiceNumber",
                schema: "legal",
                table: "Invoices",
                columns: new[] { "FirmId", "InvoiceNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_FirmId_Status",
                schema: "legal",
                table: "Invoices",
                columns: new[] { "FirmId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceDate",
                schema: "legal",
                table: "Invoices",
                column: "InvoiceDate");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Status",
                schema: "legal",
                table: "Invoices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ClientId",
                schema: "legal",
                table: "Payments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_FirmId",
                schema: "legal",
                table: "Payments",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_FirmId_PaymentDate",
                schema: "legal",
                table: "Payments",
                columns: new[] { "FirmId", "PaymentDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_InvoiceId",
                schema: "legal",
                table: "Payments",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentDate",
                schema: "legal",
                table: "Payments",
                column: "PaymentDate");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TrustTransactionId",
                schema: "legal",
                table: "Payments",
                column: "TrustTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_CaseId",
                schema: "legal",
                table: "TimeEntries",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_FirmId",
                schema: "legal",
                table: "TimeEntries",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_FirmId_CaseId_Status",
                schema: "legal",
                table: "TimeEntries",
                columns: new[] { "FirmId", "CaseId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_FirmId_UserId_WorkDate",
                schema: "legal",
                table: "TimeEntries",
                columns: new[] { "FirmId", "UserId", "WorkDate" });

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_InvoiceLineItemId",
                schema: "legal",
                table: "TimeEntries",
                column: "InvoiceLineItemId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_Status",
                schema: "legal",
                table: "TimeEntries",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_UserId",
                schema: "legal",
                table: "TimeEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntries_WorkDate",
                schema: "legal",
                table: "TimeEntries",
                column: "WorkDate");

            migrationBuilder.CreateIndex(
                name: "IX_TrustAccounts_ClientId",
                schema: "legal",
                table: "TrustAccounts",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_TrustAccounts_FirmId",
                schema: "legal",
                table: "TrustAccounts",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_TrustAccounts_FirmId_AccountReference",
                schema: "legal",
                table: "TrustAccounts",
                columns: new[] { "FirmId", "AccountReference" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrustAccounts_FirmId_IsActive",
                schema: "legal",
                table: "TrustAccounts",
                columns: new[] { "FirmId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TrustTransactions_PaymentId",
                schema: "legal",
                table: "TrustTransactions",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_TrustTransactions_PerformedByUserId",
                schema: "legal",
                table: "TrustTransactions",
                column: "PerformedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TrustTransactions_TransactionDate",
                schema: "legal",
                table: "TrustTransactions",
                column: "TransactionDate");

            migrationBuilder.CreateIndex(
                name: "IX_TrustTransactions_TrustAccountId",
                schema: "legal",
                table: "TrustTransactions",
                column: "TrustAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_TrustTransactions_TrustAccountId_TransactionDate",
                schema: "legal",
                table: "TrustTransactions",
                columns: new[] { "TrustAccountId", "TransactionDate" });

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_InvoiceLineItems_InvoiceLineItemId",
                schema: "legal",
                table: "Expenses",
                column: "InvoiceLineItemId",
                principalSchema: "legal",
                principalTable: "InvoiceLineItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLineItems_TimeEntries_TimeEntryId",
                schema: "legal",
                table: "InvoiceLineItems",
                column: "TimeEntryId",
                principalSchema: "legal",
                principalTable: "TimeEntries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_TrustTransactions_TrustTransactionId",
                schema: "legal",
                table: "Payments",
                column: "TrustTransactionId",
                principalSchema: "legal",
                principalTable: "TrustTransactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_InvoiceLineItems_InvoiceLineItemId",
                schema: "legal",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_TimeEntries_InvoiceLineItems_InvoiceLineItemId",
                schema: "legal",
                table: "TimeEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Invoices_InvoiceId",
                schema: "legal",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_TrustTransactions_TrustTransactionId",
                schema: "legal",
                table: "Payments");

            migrationBuilder.DropTable(
                name: "BillingRates",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "InvoiceLineItems",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "Expenses",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "TimeEntries",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "Invoices",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "TrustTransactions",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "Payments",
                schema: "legal");

            migrationBuilder.DropTable(
                name: "TrustAccounts",
                schema: "legal");
        }
    }
}
