using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Entities.Billing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Globalization;

namespace LegalRO.CaseManagement.Infrastructure.Services;

/// <summary>
/// QuestPDF document that renders a Romanian fiscal invoice (factura fiscala).
/// </summary>
public class InvoicePdfDocument : IDocument
{
    private readonly Invoice _invoice;
    private readonly Firm _firm;
    private static readonly CultureInfo _ro = new("ro-RO");

    public InvoicePdfDocument(Invoice invoice, Firm firm)
    {
        _invoice = invoice;
        _firm = firm;
    }

    public DocumentMetadata GetMetadata() => new()
    {
        Title = $"Factura {_invoice.InvoiceNumber}",
        Author = _firm.Name,
        CreationDate = DateTimeOffset.UtcNow
    };

    public DocumentSettings GetSettings() => DocumentSettings.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(36, Unit.Point);
            page.DefaultTextStyle(t => t.FontSize(9).FontFamily(Fonts.Arial));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().Element(ComposeFooter);
        });
    }

    // ?? Header ????????????????????????????????????????????????????????

    private void ComposeHeader(IContainer c)
    {
        c.Column(col =>
        {
            // Title bar
            col.Item().Background("#1a237e").Padding(10).AlignCenter()
               .Text("FACTURA FISCALA")
               .FontSize(16).FontColor(Colors.White).Bold();

            col.Item().Height(8);

            // 3-column: Furnizor | Meta | Client
            col.Item().Row(row =>
            {
                // LEFT — Furnizor
                row.RelativeItem().Border(0.5f).BorderColor("#c5cae9").Background("#f0f4ff").Padding(8).Column(f =>
                {
                    f.Item().Text("FURNIZOR").FontSize(7).FontColor("#1a237e").Bold();
                    f.Item().Text(_firm.Name).Bold().FontSize(10).FontColor("#1a237e");
                    if (!string.IsNullOrWhiteSpace(_firm.Address))
                        f.Item().Text($"Adresa: {_firm.Address}{(string.IsNullOrWhiteSpace(_firm.City) ? "" : ", " + _firm.City)}");
                    if (!string.IsNullOrWhiteSpace(_firm.FiscalCode))
                        f.Item().Text($"CIF: {_firm.FiscalCode}");
                    if (!string.IsNullOrWhiteSpace(_firm.RegistrationCode))
                        f.Item().Text($"Nr. Reg. Com.: {_firm.RegistrationCode}");
                    if (!string.IsNullOrWhiteSpace(_firm.Bank))
                        f.Item().Text($"Banca: {_firm.Bank}");
                    if (!string.IsNullOrWhiteSpace(_firm.BankAccount))
                        f.Item().Text($"IBAN: {_firm.BankAccount}");
                    if (!string.IsNullOrWhiteSpace(_firm.Phone))
                        f.Item().Text($"Tel: {_firm.Phone}");
                    if (!string.IsNullOrWhiteSpace(_firm.Email))
                        f.Item().Text($"Email: {_firm.Email}");
                });

                row.ConstantItem(16);

                // CENTRE — Meta
                row.ConstantItem(130).Column(m =>
                {
                    m.Item().AlignCenter().Column(mm =>
                    {
                        mm.Item().Text("Seria / Nr.").FontSize(7).FontColor("#888888").AlignCenter();
                        mm.Item().Text($"{_invoice.InvoiceNumber}").Bold().FontSize(11).FontColor("#1a237e").AlignCenter();
                        mm.Item().Height(6);
                        mm.Item().Text("Data emiterii").FontSize(7).FontColor("#888888").AlignCenter();
                        mm.Item().Text(_invoice.InvoiceDate.ToString("dd.MM.yyyy")).Bold().AlignCenter();
                        mm.Item().Height(4);
                        mm.Item().Text("Data scadentei").FontSize(7).FontColor("#888888").AlignCenter();
                        mm.Item().Text(_invoice.DueDate.ToString("dd.MM.yyyy")).Bold().FontColor("#c62828").AlignCenter();
                    });
                });

                row.ConstantItem(16);

                // RIGHT — Client
                row.RelativeItem().Border(0.5f).BorderColor("#ffe082").Background("#fff8e1").Padding(8).Column(cl =>
                {
                    cl.Item().Text("BENEFICIAR / CLIENT").FontSize(7).FontColor("#e65100").Bold();
                    cl.Item().Text(_invoice.Client.Name).Bold().FontSize(10).FontColor("#1a237e");
                    if (!string.IsNullOrWhiteSpace(_invoice.Client.Address))
                        cl.Item().Text($"Adresa: {_invoice.Client.Address}{(string.IsNullOrWhiteSpace(_invoice.Client.City) ? "" : ", " + _invoice.Client.City)}");
                    if (!string.IsNullOrWhiteSpace(_invoice.Client.FiscalCode))
                        cl.Item().Text($"CIF: {_invoice.Client.FiscalCode}");
                    if (!string.IsNullOrWhiteSpace(_invoice.Client.RegistrationCode))
                        cl.Item().Text($"Nr. Reg. Com.: {_invoice.Client.RegistrationCode}");
                    if (!string.IsNullOrWhiteSpace(_invoice.Client.Email))
                        cl.Item().Text($"Email: {_invoice.Client.Email}");
                    if (!string.IsNullOrWhiteSpace(_invoice.Client.Phone))
                        cl.Item().Text($"Tel: {_invoice.Client.Phone}");
                });
            });

            col.Item().Height(10);
        });
    }

    // ?? Content ???????????????????????????????????????????????????????

    private void ComposeContent(IContainer c)
    {
        c.Column(col =>
        {
            // Line items table
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(22);   // Nr.
                    cd.RelativeColumn(4);    // Descriere
                    cd.ConstantColumn(32);   // UM
                    cd.ConstantColumn(46);   // Cantitate
                    cd.ConstantColumn(60);   // Pret unitar
                    cd.ConstantColumn(64);   // Valoare
                });

                // Header row
                table.Header(h =>
                {
                    var headerStyle = TextStyle.Default.FontSize(8).Bold().FontColor(Colors.White);
                    h.Cell().Background("#1a237e").Padding(5).Text("Nr.").Style(headerStyle).AlignCenter();
                    h.Cell().Background("#1a237e").Padding(5).Text("Descriere serviciu").Style(headerStyle);
                    h.Cell().Background("#1a237e").Padding(5).Text("UM").Style(headerStyle).AlignCenter();
                    h.Cell().Background("#1a237e").Padding(5).Text("Cant.").Style(headerStyle).AlignCenter();
                    h.Cell().Background("#1a237e").Padding(5).Text("Pret unit.").Style(headerStyle).AlignRight();
                    h.Cell().Background("#1a237e").Padding(5).Text("Valoare").Style(headerStyle).AlignRight();
                });

                var items = _invoice.LineItems.OrderBy(l => l.LineNumber).ToList();
                for (int i = 0; i < items.Count; i++)
                {
                    var item = items[i];
                    string bg = i % 2 == 0 ? Colors.White : "#f5f7ff";
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#e0e0e0").Padding(5).Text((i + 1).ToString()).AlignCenter();
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#e0e0e0").Padding(5).Text(item.Description);
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#e0e0e0").Padding(5).Text(item.UM ?? "buc").AlignCenter();
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#e0e0e0").Padding(5).Text(item.Quantity.ToString("N2", _ro)).AlignCenter();
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#e0e0e0").Padding(5).Text(item.UnitPrice.ToString("N2", _ro)).AlignRight();
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#e0e0e0").Padding(5).Text(item.Amount.ToString("N2", _ro)).AlignRight();
                }
            });

            col.Item().Height(12);

            // Totals block (right-aligned)
            col.Item().AlignRight().Width(220).Column(tot =>
            {
                TotalRow(tot, "Subtotal", _invoice.SubTotal, _invoice.Currency.ToString());
                TotalRow(tot, $"TVA ({_invoice.VatPercent}%)", _invoice.VatAmount, _invoice.Currency.ToString());

                tot.Item().BorderTop(1).BorderColor("#1a237e").Height(1);

                tot.Item().Background("#1a237e").Padding(6).Row(r =>
                {
                    r.RelativeItem().Text("TOTAL DE PLATA").Bold().FontColor(Colors.White).FontSize(10);
                    r.AutoItem().Text($"{_invoice.TotalAmount.ToString("N2", _ro)} {_invoice.Currency}").Bold().FontColor(Colors.White).FontSize(10);
                });
            });

            if (!string.IsNullOrWhiteSpace(_invoice.Notes))
            {
                col.Item().Height(12);
                col.Item().Border(0.5f).BorderColor("#e0e0e0").Background("#fffde7").Padding(8).Column(n =>
                {
                    n.Item().Text("Mentiuni:").Bold().FontSize(8);
                    n.Item().Text(_invoice.Notes).FontSize(8);
                });
            }
        });
    }

    private static void TotalRow(ColumnDescriptor col, string label, decimal value, string currency)
    {
        col.Item().Padding(4).Row(r =>
        {
            r.RelativeItem().Text(label).FontSize(9).FontColor("#555555");
            r.AutoItem().Text($"{value.ToString("N2", new CultureInfo("ro-RO"))} {currency}").FontSize(9).Bold();
        });
    }

    // ?? Footer ????????????????????????????????????????????????????????

    private void ComposeFooter(IContainer c)
    {
        c.BorderTop(0.5f).BorderColor("#c5cae9").PaddingTop(6).Row(r =>
        {
            r.RelativeItem().Text($"Document generat automat de {_firm.Name}").FontSize(7).FontColor("#aaaaaa");
            r.AutoItem().Text(x =>
            {
                x.Span("Pag. ").FontSize(7).FontColor("#aaaaaa");
                x.CurrentPageNumber().FontSize(7).FontColor("#aaaaaa");
                x.Span(" / ").FontSize(7).FontColor("#aaaaaa");
                x.TotalPages().FontSize(7).FontColor("#aaaaaa");
            });
        });
    }
}
