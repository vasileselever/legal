using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Entities.DocumentAutomation;
using LegalRO.CaseManagement.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LegalRO.CaseManagement.Infrastructure.Data;

public static class DatabaseSeeder
{
    private static readonly Guid TestFirmId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public static async Task SeedAsync(ApplicationDbContext context, UserManager<User> userManager)
    {
        if (!await context.Firms.AnyAsync())
        {
            await SeedCoreDataAsync(context, userManager);
        }

        if (!await context.DocumentTemplates.IgnoreQueryFilters().AnyAsync())
        {
            await SeedDocumentAutomationAsync(context);
        }
    }

    private static async Task SeedCoreDataAsync(ApplicationDbContext context, UserManager<User> userManager)
    {
        var testFirm = new Firm
        {
            Id = TestFirmId,
            Name = "Cabinet Avocat Test SRL",
            FiscalCode = "RO12345678",
            BarRegistrationNumber = "BAR-123456",
            Address = "Str. Aviatorilor nr. 1",
            City = "Bucure\u0219ti",
            PostalCode = "010011",
            Phone = "+40211234567",
            Email = "contact@avocat-test.ro",
            Website = "https://www.avocat-test.ro",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };

        await context.Firms.AddAsync(testFirm);
        await context.SaveChangesAsync();

        var lawyer1 = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000011"),
            UserName = "avocat.test@avocat-test.ro",
            Email = "avocat.test@avocat-test.ro",
            FirstName = "Ion",
            LastName = "Popescu",
            FirmId = testFirm.Id,
            EmailConfirmed = true,
            PhoneNumber = "+40721111111",
            CreatedAt = DateTime.UtcNow
        };

        var lawyer2 = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000012"),
            UserName = "maria.ionescu@avocat-test.ro",
            Email = "maria.ionescu@avocat-test.ro",
            FirstName = "Maria",
            LastName = "Ionescu",
            FirmId = testFirm.Id,
            EmailConfirmed = true,
            PhoneNumber = "+40722222222",
            CreatedAt = DateTime.UtcNow
        };

        await userManager.CreateAsync(lawyer1, "Test@123456");
        await userManager.CreateAsync(lawyer2, "Test@123456");

        var client1 = new Client
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000021"),
            FirmId = testFirm.Id,
            Name = "Alexandru Dumitrescu",
            Email = "alex.dumitrescu@example.com",
            Phone = "+40733333333",
            Address = "Str. Victoriei nr. 10",
            City = "Cluj-Napoca",
            PostalCode = "400001",
            PersonalIdentificationNumber = "1234567890123",
            IsCorporate = false,
            CreatedAt = DateTime.UtcNow.AddMonths(-6),
            CreatedBy = lawyer1.Email
        };

        var client2 = new Client
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000022"),
            FirmId = testFirm.Id,
            Name = "SRL Modern Solutions",
            Email = "contact@modernsolutions.ro",
            Phone = "+40744444444",
            Address = "Bd. Unirii nr. 5",
            City = "Bucure\u0219ti",
            PostalCode = "030011",
            FiscalCode = "RO98765432",
            IsCorporate = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-3),
            CreatedBy = lawyer2.Email
        };

        await context.Clients.AddRangeAsync(client1, client2);
        await context.SaveChangesAsync();

        var case1 = new Case
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000031"),
            FirmId = testFirm.Id,
            ClientId = client1.Id,
            CaseNumber = "CAZ-2025-001",
            Title = "Divor\u021b - Alexandru Dumitrescu",
            Description = "Proces de divor\u021b cu partaj de bunuri",
            CaseType = CaseType.Litigation,
            PracticeArea = PracticeArea.Family,
            Status = CaseStatus.Active,
            ResponsibleLawyerId = lawyer1.Id,
            Court = "Tribunalul Cluj",
            BillingArrangement = BillingArrangement.Hourly,
            OpeningDate = DateTime.UtcNow.AddMonths(-2),
            CreatedAt = DateTime.UtcNow.AddMonths(-2),
            CreatedBy = lawyer1.Email
        };

        var case2 = new Case
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000032"),
            FirmId = testFirm.Id,
            ClientId = client2.Id,
            CaseNumber = "CAZ-2025-002",
            Title = "Contract Comercial - Modern Solutions",
            Description = "Consultan\u021b\u0103 contract comercial B2B",
            CaseType = CaseType.Transactional,
            PracticeArea = PracticeArea.Commercial,
            Status = CaseStatus.Active,
            ResponsibleLawyerId = lawyer2.Id,
            BillingArrangement = BillingArrangement.FlatFee,
            OpeningDate = DateTime.UtcNow.AddMonths(-1),
            CreatedAt = DateTime.UtcNow.AddMonths(-1),
            CreatedBy = lawyer2.Email
        };

        await context.Cases.AddRangeAsync(case1, case2);
        await context.SaveChangesAsync();

        Console.WriteLine("\u2705 Core data seeded successfully!");
    }

    private static async Task SeedDocumentAutomationAsync(ApplicationDbContext context)
    {
        var now = DateTime.UtcNow;

        // Clause Library

        var clauseForceM = new ClauseLibraryItem
        {
            Id = Guid.Parse("C0000000-0000-0000-0000-000000000001"),
            FirmId = null,
            Title = "For\u021b\u0103 major\u0103",
            Content = "Niciuna dintre p\u0103r\u021bi nu va fi responsabil\u0103 pentru neexecutarea sau executarea cu \u00eent\u00e2rziere a obliga\u021biilor sale contractuale, dac\u0103 aceast\u0103 neexecutare sau \u00eent\u00e2rziere este cauzat\u0103 de un eveniment de for\u021b\u0103 major\u0103, astfel cum este definit de art. 1351 Cod Civil. Partea afectat\u0103 va notifica cealalt\u0103 parte \u00een termen de 5 zile lucr\u0103toare de la producerea evenimentului.",
            ContentEn = "Neither party shall be liable for failure or delay in performing its contractual obligations if such failure or delay is caused by a force majeure event as defined by Art. 1351 of the Civil Code. The affected party shall notify the other party within 5 business days of the occurrence of the event.",
            Category = DocumentCategory.ServiceAgreement,
            PracticeArea = PracticeArea.Civil,
            RiskLevel = ClauseRiskLevel.Neutral,
            Commentary = "Clauza standard de for\u021b\u0103 major\u0103. Conform art. 1351 Cod Civil, for\u021ba major\u0103 exonereaz\u0103 de r\u0103spundere.",
            LegalReferences = "ICCJ Dec. nr. 12/2020 \u2013 Interpretarea for\u021bei majore",
            ApplicableLaw = "Art. 1351 Cod Civil (Legea nr. 287/2009)",
            IsMandatory = false,
            Tags = "for\u021b\u0103 major\u0103,exonerare,r\u0103spundere",
            IsActive = true,
            CreatedAt = now
        };

        var clauseConfid = new ClauseLibraryItem
        {
            Id = Guid.Parse("C0000000-0000-0000-0000-000000000002"),
            FirmId = null,
            Title = "Confiden\u021bialitate",
            Content = "P\u0103r\u021bile se oblig\u0103 s\u0103 p\u0103streze confiden\u021bialitatea tuturor informa\u021biilor transmise \u00een cadrul sau \u00een leg\u0103tur\u0103 cu prezentul contract. Aceast\u0103 obliga\u021bie va supravie\u021bui \u00eencet\u0103rii contractului pentru o perioad\u0103 de {{durata_confidentialitate}} ani. \u00CEnc\u0103lcarea acestei obliga\u021bii d\u0103 dreptul p\u0103r\u021bii prejudiciate la daune-interese conform art. 1530 Cod Civil.",
            ContentEn = "The parties undertake to maintain the confidentiality of all information transmitted within or in connection with this contract. This obligation shall survive termination of the contract for a period of {{durata_confidentialitate}} years. Breach of this obligation entitles the aggrieved party to damages pursuant to Art. 1530 of the Civil Code.",
            Category = DocumentCategory.NonDisclosureAgreement,
            PracticeArea = PracticeArea.Commercial,
            RiskLevel = ClauseRiskLevel.Favorable,
            Commentary = "Clauz\u0103 favorabil\u0103: protejeaz\u0103 informa\u021biile comerciale sensibile. Asigura\u021bi-v\u0103 c\u0103 durata este rezonabil\u0103 (2-5 ani).",
            LegalReferences = "ICCJ Sec. II Civil\u0103, dec. nr. 892/2019",
            ApplicableLaw = "Art. 1530 Cod Civil; Legea nr. 11/1991 concuren\u021ba neloial\u0103",
            IsMandatory = false,
            Tags = "confiden\u021bialitate,NDA,secret comercial",
            IsActive = true,
            CreatedAt = now
        };

        var clausePenalitate = new ClauseLibraryItem
        {
            Id = Guid.Parse("C0000000-0000-0000-0000-000000000003"),
            FirmId = null,
            Title = "Clauz\u0103 penal\u0103 pentru \u00eent\u00e2rziere",
            Content = "\u00CEN cazul neexecut\u0103rii la termen a obliga\u021biilor contractuale, partea \u00een culp\u0103 va pl\u0103ti celeilalte p\u0103r\u021bi penalit\u0103\u021bi de {{procent_penalitate}}% pe zi de \u00eent\u00e2rziere din valoarea obliga\u021biei neexecutate, dar nu mai mult de {{plafon_penalitate}}% din valoarea total\u0103 a contractului.",
            ContentEn = "In case of late performance of contractual obligations, the party at fault shall pay the other party penalties of {{procent_penalitate}}% per day of delay on the value of the unperformed obligation, but not exceeding {{plafon_penalitate}}% of the total contract value.",
            Category = DocumentCategory.ServiceAgreement,
            PracticeArea = PracticeArea.Commercial,
            RiskLevel = ClauseRiskLevel.Unfavorable,
            Commentary = "Aten\u021bie: penalit\u0103\u021bile excesive pot fi reduse de instan\u021b\u0103 (art. 1541 Cod Civil). Un procent de 0.1-0.5%/zi este considerat rezonabil.",
            LegalReferences = "ICCJ Dec. nr. 21/2022 \u2013 Reducerea clauzei penale",
            ApplicableLaw = "Art. 1538-1543 Cod Civil",
            IsMandatory = false,
            Tags = "penalitate,\u00eent\u00e2rziere,clauz\u0103 penal\u0103",
            IsActive = true,
            CreatedAt = now
        };

        var clauseGdpr = new ClauseLibraryItem
        {
            Id = Guid.Parse("C0000000-0000-0000-0000-000000000004"),
            FirmId = null,
            Title = "Protec\u021bia datelor personale (GDPR)",
            Content = "P\u0103r\u021bile se oblig\u0103 s\u0103 respecte prevederile Regulamentului (UE) 2016/679 (GDPR) \u0219i ale Legii nr. 190/2018 privind prelucrarea datelor cu caracter personal. Prelucrarea datelor personale \u00een cadrul prezentului contract se va efectua exclusiv \u00een scopul execut\u0103rii contractului, cu respectarea principiilor legalit\u0103\u021bii, transparen\u021bei \u0219i minimiz\u0103rii datelor.",
            ContentEn = "The parties undertake to comply with Regulation (EU) 2016/679 (GDPR) and Law no. 190/2018 regarding the processing of personal data. The processing of personal data under this contract shall be carried out exclusively for the purpose of contract execution, in compliance with the principles of lawfulness, transparency and data minimization.",
            Category = DocumentCategory.GdprComplianceDocument,
            PracticeArea = PracticeArea.Corporate,
            RiskLevel = ClauseRiskLevel.Favorable,
            Commentary = "Obligatorie \u00een contractele ce implic\u0103 prelucrarea datelor personale. Lipsa acestei clauze poate atrage amenzi ANSPDCP.",
            LegalReferences = "ANSPDCP Decizia nr. 174/2020",
            ApplicableLaw = "Regulamentul (UE) 2016/679; Legea nr. 190/2018",
            IsMandatory = true,
            Tags = "GDPR,date personale,ANSPDCP,privacy",
            IsActive = true,
            CreatedAt = now
        };

        var clauseJurisdict = new ClauseLibraryItem
        {
            Id = Guid.Parse("C0000000-0000-0000-0000-000000000005"),
            FirmId = null,
            Title = "Legea aplicabil\u0103 \u0219i jurisdic\u021bia",
            Content = "Prezentul contract este guvernat de legea rom\u00e2n\u0103. Orice litigiu decurg\u00e2nd din sau \u00een leg\u0103tur\u0103 cu prezentul contract va fi solu\u021bionat de instan\u021bele judec\u0103tore\u0219ti competente de la sediul/domiciliul {{parte_reclamanta}}.",
            ContentEn = "This contract is governed by Romanian law. Any dispute arising out of or in connection with this contract shall be settled by the competent courts at the headquarters/domicile of {{parte_reclamanta}}.",
            Category = DocumentCategory.ServiceAgreement,
            PracticeArea = PracticeArea.Civil,
            RiskLevel = ClauseRiskLevel.Neutral,
            Commentary = "Standard pentru contractele interne. Pentru contracte interna\u021bionale, lua\u021bi \u00een considerare arbitrajul.",
            ApplicableLaw = "Art. 1203 Cod Civil; Art. 107 NCPC",
            IsMandatory = false,
            Tags = "jurisdic\u021bie,lege aplicabil\u0103,competen\u021b\u0103",
            IsActive = true,
            CreatedAt = now
        };

        var clauseCesiune = new ClauseLibraryItem
        {
            Id = Guid.Parse("C0000000-0000-0000-0000-000000000006"),
            FirmId = null,
            Title = "Interdic\u021bia cesiunii",
            Content = "Niciuna dintre p\u0103r\u021bi nu poate cesiona drepturile sau obliga\u021biile din prezentul contract f\u0103r\u0103 acordul scris \u0219i prealabil al celeilalte p\u0103r\u021bi.",
            ContentEn = "Neither party may assign its rights or obligations under this contract without the prior written consent of the other party.",
            Category = DocumentCategory.ServiceAgreement,
            PracticeArea = PracticeArea.Commercial,
            RiskLevel = ClauseRiskLevel.Favorable,
            Commentary = "Protejeaz\u0103 ambele p\u0103r\u021bi \u00eempotriva transferului neautorizat al contractului.",
            ApplicableLaw = "Art. 1315-1320 Cod Civil",
            IsMandatory = false,
            Tags = "cesiune,transfer,restric\u021bie",
            IsActive = true,
            CreatedAt = now
        };

        await context.ClauseLibraryItems.AddRangeAsync(
            clauseForceM, clauseConfid, clausePenalitate, clauseGdpr, clauseJurisdict, clauseCesiune);
        await context.SaveChangesAsync();

        // Template 1: Contract de prestari servicii

        var tplServicii = new DocumentTemplate
        {
            Id = Guid.Parse("A0000000-0000-0000-0000-000000000001"),
            FirmId = TestFirmId,
            Name = "Contract de prest\u0103ri servicii",
            Description = "Contract standard pentru prestarea de servicii \u00eentre dou\u0103 persoane juridice sau fizice. Include clauze de confiden\u021bialitate, penalit\u0103\u021bi \u0219i GDPR.",
            Category = DocumentCategory.ServiceAgreement,
            PracticeArea = PracticeArea.Commercial,
            Language = DocumentLanguage.Bilingual,
            EstimatedMinutes = 15,
            Tags = "servicii,prest\u0103ri,B2B,contract",
            IsActive = true,
            IsSystemTemplate = true,
            Version = 1,
            CreatedAt = now,
            BodyTemplate = "<h1 style=\"text-align:center\">CONTRACT DE PREST\u0102RI SERVICII</h1>\n<p style=\"text-align:center\">Nr. {{numar_contract}} din {{data_contract}}</p>\n\n<h2>I. P\u0102R\u021aILE CONTRACTANTE</h2>\n<p><strong>PRESTATORUL:</strong> {{prestator_nume}}, cu sediul \u00een {{prestator_adresa}}, CUI {{prestator_cui}}, reprezentat prin {{prestator_reprezentant}}, \u00een calitate de {{prestator_functie}}.</p>\n<p><strong>BENEFICIARUL:</strong> {{beneficiar_nume}}, cu sediul \u00een {{beneficiar_adresa}}, CUI {{beneficiar_cui}}, reprezentat prin {{beneficiar_reprezentant}}, \u00een calitate de {{beneficiar_functie}}.</p>\n\n<h2>II. OBIECTUL CONTRACTULUI</h2>\n<p>Prestatorul se oblig\u0103 s\u0103 presteze \u00een favoarea Beneficiarului urm\u0103toarele servicii: {{descriere_servicii}}</p>\n\n<h2>III. DURATA CONTRACTULUI</h2>\n<p>Prezentul contract se \u00eencheie pe o perioad\u0103 de {{durata_contract}}, \u00eencep\u00e2nd cu data de {{data_inceput}} p\u00e2n\u0103 la data de {{data_sfarsit}}.</p>\n\n<h2>IV. PRE\u021aUL \u0218I MODALITATEA DE PLAT\u0102</h2>\n<p>Pre\u021bul total al serviciilor este de {{pret_total}} {{moneda}}, {{include_tva}}.</p>\n<p>Plata se va efectua {{modalitate_plata}}.</p>\n\n<h2>V. OBLIGA\u021aIILE PRESTATORULUI</h2>\n<ul>\n<li>S\u0103 presteze serviciile conform specifica\u021biilor agreate</li>\n<li>S\u0103 respecte termenele stabilite</li>\n<li>S\u0103 informeze beneficiarul asupra stadiului serviciilor</li>\n</ul>\n\n<h2>VI. OBLIGA\u021aIILE BENEFICIARULUI</h2>\n<ul>\n<li>S\u0103 pl\u0103teasc\u0103 pre\u021bul convenit la termenele stabilite</li>\n<li>S\u0103 furnizeze informa\u021biile necesare pentru prestarea serviciilor</li>\n<li>S\u0103 recep\u021bioneze serviciile \u00een termen de {{termen_receptie}} zile</li>\n</ul>\n\n<h2>VII. DISPOZI\u021aII FINALE</h2>\n<p>Prezentul contract a fost \u00eencheiat \u00een 2 (dou\u0103) exemplare originale, c\u00e2te unul pentru fiecare parte.</p>\n\n<table style=\"width:100%;margin-top:2rem\">\n<tr>\n<td style=\"width:50%\"><strong>PRESTATOR</strong><br/>{{prestator_nume}}<br/>Prin: {{prestator_reprezentant}}</td>\n<td style=\"width:50%\"><strong>BENEFICIAR</strong><br/>{{beneficiar_nume}}<br/>Prin: {{beneficiar_reprezentant}}</td>\n</tr>\n</table>",
            BodyTemplateEn = "<h1 style=\"text-align:center\">SERVICE AGREEMENT</h1>\n<p style=\"text-align:center\">No. {{numar_contract}} dated {{data_contract}}</p>\n\n<h2>I. CONTRACTING PARTIES</h2>\n<p><strong>SERVICE PROVIDER:</strong> {{prestator_nume}}, headquartered at {{prestator_adresa}}, Tax ID {{prestator_cui}}, represented by {{prestator_reprezentant}}, as {{prestator_functie}}.</p>\n<p><strong>CLIENT:</strong> {{beneficiar_nume}}, headquartered at {{beneficiar_adresa}}, Tax ID {{beneficiar_cui}}, represented by {{beneficiar_reprezentant}}, as {{beneficiar_functie}}.</p>\n\n<h2>II. OBJECT OF THE CONTRACT</h2>\n<p>The Service Provider undertakes to provide the Client with the following services: {{descriere_servicii}}</p>\n\n<h2>III. DURATION</h2>\n<p>This contract is concluded for a period of {{durata_contract}}, starting from {{data_inceput}} until {{data_sfarsit}}.</p>\n\n<h2>IV. PRICE AND PAYMENT TERMS</h2>\n<p>The total price for services is {{pret_total}} {{moneda}}, {{include_tva}}.</p>\n<p>Payment shall be made {{modalitate_plata}}.</p>\n\n<h2>V. OBLIGATIONS OF THE SERVICE PROVIDER</h2>\n<ul>\n<li>To provide services according to agreed specifications</li>\n<li>To respect agreed deadlines</li>\n<li>To inform the client about service progress</li>\n</ul>\n\n<h2>VI. OBLIGATIONS OF THE CLIENT</h2>\n<ul>\n<li>To pay the agreed price at established deadlines</li>\n<li>To provide information necessary for service delivery</li>\n<li>To accept services within {{termen_receptie}} days</li>\n</ul>\n\n<h2>VII. FINAL PROVISIONS</h2>\n<p>This contract has been concluded in 2 (two) original copies, one for each party.</p>"
        };

        var serviciiFields = new List<DocumentTemplateField>
        {
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "numar_contract", Label = "Num\u0103rul contractului", LabelEn = "Contract number", FieldType = TemplateFieldType.Text, SortOrder = 1, Section = "Date contract", IsRequired = true, HelpText = "Ex: PS-2025-001", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "data_contract", Label = "Data contractului", LabelEn = "Contract date", FieldType = TemplateFieldType.Date, SortOrder = 2, Section = "Date contract", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "prestator_nume", Label = "Denumirea prestatorului", LabelEn = "Provider name", FieldType = TemplateFieldType.Text, SortOrder = 3, Section = "Prestator", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "prestator_adresa", Label = "Adresa prestatorului", LabelEn = "Provider address", FieldType = TemplateFieldType.Address, SortOrder = 4, Section = "Prestator", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "prestator_cui", Label = "CUI prestator", LabelEn = "Provider Tax ID", FieldType = TemplateFieldType.Cui, SortOrder = 5, Section = "Prestator", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "prestator_reprezentant", Label = "Reprezentant prestator", LabelEn = "Provider representative", FieldType = TemplateFieldType.Text, SortOrder = 6, Section = "Prestator", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "prestator_functie", Label = "Func\u021bia reprezentantului", LabelEn = "Representative title", FieldType = TemplateFieldType.Text, SortOrder = 7, Section = "Prestator", IsRequired = false, DefaultValue = "Administrator", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "beneficiar_nume", Label = "Denumirea beneficiarului", LabelEn = "Client name", FieldType = TemplateFieldType.Text, SortOrder = 8, Section = "Beneficiar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "beneficiar_adresa", Label = "Adresa beneficiarului", LabelEn = "Client address", FieldType = TemplateFieldType.Address, SortOrder = 9, Section = "Beneficiar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "beneficiar_cui", Label = "CUI beneficiar", LabelEn = "Client Tax ID", FieldType = TemplateFieldType.Cui, SortOrder = 10, Section = "Beneficiar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "beneficiar_reprezentant", Label = "Reprezentant beneficiar", LabelEn = "Client representative", FieldType = TemplateFieldType.Text, SortOrder = 11, Section = "Beneficiar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "beneficiar_functie", Label = "Func\u021bia reprezentantului", LabelEn = "Representative title", FieldType = TemplateFieldType.Text, SortOrder = 12, Section = "Beneficiar", IsRequired = false, DefaultValue = "Administrator", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "descriere_servicii", Label = "Descrierea serviciilor", LabelEn = "Description of services", FieldType = TemplateFieldType.TextArea, SortOrder = 13, Section = "Obiect", IsRequired = true, HelpText = "Descrie\u021bi \u00een detaliu serviciile ce urmeaz\u0103 a fi prestate", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "durata_contract", Label = "Durata contractului", LabelEn = "Contract duration", FieldType = TemplateFieldType.Text, SortOrder = 14, Section = "Durat\u0103 & Pre\u021b", IsRequired = true, HelpText = "Ex: 12 luni, 6 luni", DefaultValue = "12 luni", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "data_inceput", Label = "Data de \u00eenceput", LabelEn = "Start date", FieldType = TemplateFieldType.Date, SortOrder = 15, Section = "Durat\u0103 & Pre\u021b", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "data_sfarsit", Label = "Data de sf\u00e2r\u0219it", LabelEn = "End date", FieldType = TemplateFieldType.Date, SortOrder = 16, Section = "Durat\u0103 & Pre\u021b", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "pret_total", Label = "Pre\u021b total", LabelEn = "Total price", FieldType = TemplateFieldType.Currency, SortOrder = 17, Section = "Durat\u0103 & Pre\u021b", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "moneda", Label = "Moneda", LabelEn = "Currency", FieldType = TemplateFieldType.SingleChoice, SortOrder = 18, Section = "Durat\u0103 & Pre\u021b", IsRequired = true, OptionsJson = "[\"RON\",\"EUR\",\"USD\"]", DefaultValue = "RON", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "include_tva", Label = "TVA inclus?", LabelEn = "VAT included?", FieldType = TemplateFieldType.SingleChoice, SortOrder = 19, Section = "Durat\u0103 & Pre\u021b", IsRequired = true, OptionsJson = "[\"inclusiv TVA\",\"exclusiv TVA\",\"neimpozabil\"]", DefaultValue = "exclusiv TVA", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "modalitate_plata", Label = "Modalitatea de plat\u0103", LabelEn = "Payment method", FieldType = TemplateFieldType.SingleChoice, SortOrder = 20, Section = "Durat\u0103 & Pre\u021b", IsRequired = true, OptionsJson = "[\"integral la semnare\",\"50% avans + 50% la finalizare\",\"lunar, \u00een baza facturii\",\"la finalizarea serviciilor\"]", DefaultValue = "lunar, \u00een baza facturii", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "termen_receptie", Label = "Termen recep\u021bie (zile)", LabelEn = "Acceptance period (days)", FieldType = TemplateFieldType.Number, SortOrder = 21, Section = "Durat\u0103 & Pre\u021b", IsRequired = false, DefaultValue = "5", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "durata_confidentialitate", Label = "Durata confiden\u021bialit\u0103\u021bii (ani)", LabelEn = "Confidentiality duration (years)", FieldType = TemplateFieldType.Number, SortOrder = 22, Section = "Clauze speciale", IsRequired = false, DefaultValue = "3", HelpText = "Perioada \u00een care obliga\u021bia de confiden\u021bialitate r\u0103m\u00e2ne activ\u0103 dup\u0103 \u00eencetarea contractului", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "procent_penalitate", Label = "Procent penalitate pe zi (%)", LabelEn = "Daily penalty percentage (%)", FieldType = TemplateFieldType.Text, SortOrder = 23, Section = "Clauze speciale", IsRequired = false, DefaultValue = "0.1", HelpText = "Procentul de penalitate pe zi de \u00eent\u00e2rziere (ex: 0.1)", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "plafon_penalitate", Label = "Plafonul penalit\u0103\u021bii (%)", LabelEn = "Penalty cap (%)", FieldType = TemplateFieldType.Text, SortOrder = 24, Section = "Clauze speciale", IsRequired = false, DefaultValue = "10", HelpText = "Procentul maxim al penalit\u0103\u021bii din valoarea total\u0103 a contractului", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, FieldKey = "parte_reclamanta", Label = "Partea reclamant\u0103 (jurisdic\u021bie)", LabelEn = "Claimant party (jurisdiction)", FieldType = TemplateFieldType.SingleChoice, SortOrder = 25, Section = "Clauze speciale", IsRequired = false, OptionsJson = "[\"Prestatorului\",\"Beneficiarului\"]", DefaultValue = "Prestatorului", HelpText = "Instan\u021ba competent\u0103 va fi cea de la sediul/domiciliul acestei p\u0103r\u021bi", CreatedAt = now },
        };

        tplServicii.Fields = serviciiFields;
        context.DocumentTemplates.Add(tplServicii);
        await context.SaveChangesAsync();

        context.TemplateClauseMappings.AddRange(
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, ClauseId = clauseConfid.Id, SortOrder = 1, IsRequired = true, CreatedAt = now },
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, ClauseId = clauseGdpr.Id, SortOrder = 2, IsRequired = true, CreatedAt = now },
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, ClauseId = clausePenalitate.Id, SortOrder = 3, IsRequired = false, CreatedAt = now },
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, ClauseId = clauseForceM.Id, SortOrder = 4, IsRequired = false, CreatedAt = now },
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplServicii.Id, ClauseId = clauseJurisdict.Id, SortOrder = 5, IsRequired = true, CreatedAt = now }
        );
        await context.SaveChangesAsync();

        // Template 2: Contract de inchiriere

        var tplInchiriere = new DocumentTemplate
        {
            Id = Guid.Parse("A0000000-0000-0000-0000-000000000002"),
            FirmId = TestFirmId,
            Name = "Contract de \u00eenchiriere (locuin\u021b\u0103)",
            Description = "Contract de \u00eenchiriere pentru spa\u021bii reziden\u021biale, conform Codului Civil. Include clauze obligatorii privind garan\u021bia, starea imobilului \u0219i predarea.",
            Category = DocumentCategory.LeaseAgreement,
            PracticeArea = PracticeArea.RealEstate,
            Language = DocumentLanguage.Romanian,
            EstimatedMinutes = 12,
            Tags = "\u00eenchiriere,locuin\u021b\u0103,chirie,imobiliar",
            IsActive = true,
            IsSystemTemplate = true,
            Version = 1,
            CreatedAt = now,
            BodyTemplate = "<h1 style=\"text-align:center\">CONTRACT DE \u00CENCHIRIERE</h1>\n<p style=\"text-align:center\">Nr. {{numar_contract}} din {{data_contract}}</p>\n\n<h2>I. P\u0102R\u021aILE CONTRACTANTE</h2>\n<p><strong>PROPRIETAR (Locator):</strong> {{proprietar_nume}}, CNP/CUI {{proprietar_cnp}}, domiciliat/cu sediul \u00een {{proprietar_adresa}}, telefon {{proprietar_telefon}}, email {{proprietar_email}}.</p>\n<p><strong>CHIRIA\u0218 (Locatar):</strong> {{chirias_nume}}, CNP {{chirias_cnp}}, domiciliat \u00een {{chirias_adresa}}, telefon {{chirias_telefon}}, email {{chirias_email}}.</p>\n\n<h2>II. OBIECTUL CONTRACTULUI</h2>\n<p>Proprietarul \u00eenchiriaz\u0103 Chiria\u0219ului imobilul situat la adresa: {{adresa_imobil}}, compus din {{descriere_imobil}}, \u00een suprafa\u021b\u0103 util\u0103 de {{suprafata}} mp.</p>\n\n<h2>III. DURATA CONTRACTULUI</h2>\n<p>Contractul se \u00eencheie pe o perioad\u0103 de {{durata}} luni, de la {{data_inceput}} p\u00e2n\u0103 la {{data_sfarsit}}.</p>\n\n<h2>IV. CHIRIA \u0218I CHELTUIELILE</h2>\n<p>Chiria lunar\u0103 este de <strong>{{chirie_lunara}} {{moneda}}</strong>, pl\u0103tibil\u0103 p\u00e2n\u0103 la data de <strong>{{zi_plata}}</strong> a fiec\u0103rei luni.</p>\n<p>Utilit\u0103\u021bile ({{utilitati}}) sunt \u00een sarcina <strong>{{platitor_utilitati}}</strong>.</p>\n\n<h2>V. GARAN\u021aIA</h2>\n<p>La semnarea contractului, Chiria\u0219ul achit\u0103 o garan\u021bie de <strong>{{garantie}} {{moneda}}</strong> (echivalentul a {{luni_garantie}} chirie/chirii lunare). Garan\u021bia se restituie la \u00eencetarea contractului, minus eventualele daune.</p>\n\n<h2>VI. STAREA IMOBILULUI</h2>\n<p>Imobilul se pred\u0103 \u00een stare {{stare_imobil}}. Se va \u00eentocmi un proces-verbal de predare-primire semnat de ambele p\u0103r\u021bi.</p>\n\n<h2>VII. DISPOZI\u021aII FINALE</h2>\n<p>Prezentul contract constituie titlu executoriu conform art. 1798 Cod Civil, dac\u0103 este \u00eenregistrat la ANAF.</p>\n<p>\u00CEncheiat \u00een 2 (dou\u0103) exemplare originale.</p>\n\n<table style=\"width:100%;margin-top:2rem\">\n<tr>\n<td style=\"width:50%\"><strong>PROPRIETAR</strong><br/>{{proprietar_nume}}</td>\n<td style=\"width:50%\"><strong>CHIRIA\u0218</strong><br/>{{chirias_nume}}</td>\n</tr>\n</table>"
        };

        var inchiriereFields = new List<DocumentTemplateField>
        {
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "numar_contract", Label = "Num\u0103r contract", FieldType = TemplateFieldType.Text, SortOrder = 1, Section = "Date contract", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "data_contract", Label = "Data contractului", FieldType = TemplateFieldType.Date, SortOrder = 2, Section = "Date contract", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "proprietar_nume", Label = "Numele proprietarului", FieldType = TemplateFieldType.Text, SortOrder = 3, Section = "Proprietar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "proprietar_cnp", Label = "CNP/CUI proprietar", FieldType = TemplateFieldType.Text, SortOrder = 4, Section = "Proprietar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "proprietar_adresa", Label = "Adresa proprietarului", FieldType = TemplateFieldType.Address, SortOrder = 5, Section = "Proprietar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "proprietar_telefon", Label = "Telefon proprietar", FieldType = TemplateFieldType.Phone, SortOrder = 6, Section = "Proprietar", IsRequired = false, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "proprietar_email", Label = "Email proprietar", FieldType = TemplateFieldType.Email, SortOrder = 7, Section = "Proprietar", IsRequired = false, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "chirias_nume", Label = "Numele chiria\u0219ului", FieldType = TemplateFieldType.Text, SortOrder = 8, Section = "Chiria\u0219", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "chirias_cnp", Label = "CNP chiria\u0219", FieldType = TemplateFieldType.Cnp, SortOrder = 9, Section = "Chiria\u0219", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "chirias_adresa", Label = "Adresa actual\u0103 chiria\u0219", FieldType = TemplateFieldType.Address, SortOrder = 10, Section = "Chiria\u0219", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "chirias_telefon", Label = "Telefon chiria\u0219", FieldType = TemplateFieldType.Phone, SortOrder = 11, Section = "Chiria\u0219", IsRequired = false, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "chirias_email", Label = "Email chiria\u0219", FieldType = TemplateFieldType.Email, SortOrder = 12, Section = "Chiria\u0219", IsRequired = false, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "adresa_imobil", Label = "Adresa imobilului \u00eenchiriat", FieldType = TemplateFieldType.Address, SortOrder = 13, Section = "Imobil", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "descriere_imobil", Label = "Descriere imobil", FieldType = TemplateFieldType.Text, SortOrder = 14, Section = "Imobil", IsRequired = true, HelpText = "Ex: apartament 2 camere, decomandat, etaj 3", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "suprafata", Label = "Suprafa\u021b\u0103 util\u0103 (mp)", FieldType = TemplateFieldType.Number, SortOrder = 15, Section = "Imobil", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "stare_imobil", Label = "Starea imobilului", FieldType = TemplateFieldType.SingleChoice, SortOrder = 16, Section = "Imobil", IsRequired = true, OptionsJson = "[\"bun\u0103\",\"foarte bun\u0103\",\"necesit\u0103 repara\u021bii minore\"]", DefaultValue = "bun\u0103", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "durata", Label = "Durata (luni)", FieldType = TemplateFieldType.Number, SortOrder = 17, Section = "Condi\u021bii financiare", IsRequired = true, DefaultValue = "12", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "data_inceput", Label = "Data de \u00eenceput", FieldType = TemplateFieldType.Date, SortOrder = 18, Section = "Condi\u021bii financiare", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "data_sfarsit", Label = "Data de sf\u00e2r\u0219it", FieldType = TemplateFieldType.Date, SortOrder = 19, Section = "Condi\u021bii financiare", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "chirie_lunara", Label = "Chiria lunar\u0103", FieldType = TemplateFieldType.Currency, SortOrder = 20, Section = "Condi\u021bii financiare", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "moneda", Label = "Moneda", FieldType = TemplateFieldType.SingleChoice, SortOrder = 21, Section = "Condi\u021bii financiare", IsRequired = true, OptionsJson = "[\"RON\",\"EUR\"]", DefaultValue = "EUR", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "zi_plata", Label = "Ziua de plat\u0103", FieldType = TemplateFieldType.Number, SortOrder = 22, Section = "Condi\u021bii financiare", IsRequired = true, DefaultValue = "5", HelpText = "Ziua din lun\u0103 p\u00e2n\u0103 la care se pl\u0103te\u0219te chiria", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "garantie", Label = "Garan\u021bia (suma)", FieldType = TemplateFieldType.Currency, SortOrder = 23, Section = "Condi\u021bii financiare", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "luni_garantie", Label = "Garan\u021bie echivalent (luni)", FieldType = TemplateFieldType.Number, SortOrder = 24, Section = "Condi\u021bii financiare", IsRequired = true, DefaultValue = "2", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "utilitati", Label = "Utilit\u0103\u021bi incluse", FieldType = TemplateFieldType.MultipleChoice, SortOrder = 25, Section = "Condi\u021bii financiare", IsRequired = true, OptionsJson = "[\"electricitate\",\"gaz\",\"ap\u0103\",\"internet\",\"\u00eentre\u021binere bloc\"]", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, FieldKey = "platitor_utilitati", Label = "Pl\u0103titor utilit\u0103\u021bi", FieldType = TemplateFieldType.SingleChoice, SortOrder = 26, Section = "Condi\u021bii financiare", IsRequired = true, OptionsJson = "[\"chiria\u0219ului\",\"proprietarului\"]", DefaultValue = "chiria\u0219ului", CreatedAt = now },
        };

        tplInchiriere.Fields = inchiriereFields;
        context.DocumentTemplates.Add(tplInchiriere);
        await context.SaveChangesAsync();

        context.TemplateClauseMappings.AddRange(
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, ClauseId = clauseJurisdict.Id, SortOrder = 1, IsRequired = true, CreatedAt = now },
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplInchiriere.Id, ClauseId = clauseForceM.Id, SortOrder = 2, IsRequired = false, CreatedAt = now }
        );
        await context.SaveChangesAsync();

        // Template 3: NDA

        var tplNda = new DocumentTemplate
        {
            Id = Guid.Parse("A0000000-0000-0000-0000-000000000003"),
            FirmId = TestFirmId,
            Name = "Acord de confiden\u021bialitate (NDA)",
            Description = "Acord de confiden\u021bialitate bilateral pentru protec\u021bia informa\u021biilor comerciale sensibile \u00eentre dou\u0103 p\u0103r\u021bi.",
            Category = DocumentCategory.NonDisclosureAgreement,
            PracticeArea = PracticeArea.Commercial,
            Language = DocumentLanguage.Bilingual,
            EstimatedMinutes = 8,
            Tags = "NDA,confiden\u021bialitate,secret comercial",
            IsActive = true,
            IsSystemTemplate = true,
            Version = 1,
            CreatedAt = now,
            BodyTemplate = "<h1 style=\"text-align:center\">ACORD DE CONFIDEN\u021aIALITATE (NDA)</h1>\n<p style=\"text-align:center\">\u00CEncheiat la data de {{data_acord}}</p>\n\n<h2>\u00CENTRE:</h2>\n<p><strong>1. {{parte1_nume}}</strong>, cu sediul \u00een {{parte1_adresa}}, CUI {{parte1_cui}}, reprezentat\u0103 prin {{parte1_reprezentant}} (\"Partea 1\")</p>\n<p><strong>2. {{parte2_nume}}</strong>, cu sediul \u00een {{parte2_adresa}}, CUI {{parte2_cui}}, reprezentat\u0103 prin {{parte2_reprezentant}} (\"Partea 2\")</p>\n\n<h2>ART. 1 \u2013 SCOPUL</h2>\n<p>Prezentul acord se \u00eencheie \u00een vederea protej\u0103rii informa\u021biilor confiden\u021biale comunicate \u00een contextul: {{scop_nda}}</p>\n\n<h2>ART. 2 \u2013 DEFINI\u021aIA INFORMA\u021aIILOR CONFIDEN\u021aIALE</h2>\n<p>Prin \"Informa\u021bii Confiden\u021biale\" se \u00een\u021belege orice informa\u021bie, \u00een orice format, inclusiv dar f\u0103r\u0103 a se limita la: date financiare, strategii de afaceri, liste de clien\u021bi, secrete comerciale, know-how tehnic, brevete, prototipuri.</p>\n\n<h2>ART. 3 \u2013 OBLIGA\u021aII</h2>\n<p>Fiecare parte se oblig\u0103:</p>\n<ul>\n<li>S\u0103 nu divulge Informa\u021biile Confiden\u021biale ter\u021belor persoane</li>\n<li>S\u0103 foloseasc\u0103 Informa\u021biile Confiden\u021biale exclusiv \u00een scopul stabilit la Art. 1</li>\n<li>S\u0103 ia m\u0103suri rezonabile de protec\u021bie (cel pu\u021bin la nivelul protec\u021biei propriilor informa\u021bii)</li>\n<li>S\u0103 limiteze accesul la angaja\u021bii care au nevoie s\u0103 cunoasc\u0103 informa\u021biile</li>\n</ul>\n\n<h2>ART. 4 \u2013 DURATA</h2>\n<p>Obliga\u021biile de confiden\u021bialitate vor fi \u00een vigoare pentru o perioad\u0103 de <strong>{{durata_nda}} ani</strong> de la data semn\u0103rii.</p>\n\n<h2>ART. 5 \u2013 PENALIT\u0102\u021aI</h2>\n<p>\u00CEnc\u0103lcarea obliga\u021biilor de confiden\u021bialitate d\u0103 dreptul p\u0103r\u021bii prejudiciate la daune-interese \u00een cuantum de <strong>{{penalitate}} {{moneda}}</strong>, f\u0103r\u0103 a prejudicia dreptul la daune suplimentare dovedite.</p>\n\n<h2>ART. 6 \u2013 LEGEA APLICABIL\u0102</h2>\n<p>Prezentul acord este guvernat de legea rom\u00e2n\u0103.</p>\n\n<table style=\"width:100%;margin-top:2rem\">\n<tr>\n<td style=\"width:50%\"><strong>PARTEA 1</strong><br/>{{parte1_nume}}<br/>Prin: {{parte1_reprezentant}}</td>\n<td style=\"width:50%\"><strong>PARTEA 2</strong><br/>{{parte2_nume}}<br/>Prin: {{parte2_reprezentant}}</td>\n</tr>\n</table>",
            BodyTemplateEn = "<h1 style=\"text-align:center\">NON-DISCLOSURE AGREEMENT (NDA)</h1>\n<p style=\"text-align:center\">Executed on {{data_acord}}</p>\n\n<h2>BETWEEN:</h2>\n<p><strong>1. {{parte1_nume}}</strong>, headquartered at {{parte1_adresa}}, Tax ID {{parte1_cui}}, represented by {{parte1_reprezentant}} (\"Party 1\")</p>\n<p><strong>2. {{parte2_nume}}</strong>, headquartered at {{parte2_adresa}}, Tax ID {{parte2_cui}}, represented by {{parte2_reprezentant}} (\"Party 2\")</p>\n\n<h2>ART. 1 \u2013 PURPOSE</h2>\n<p>This agreement is concluded for the protection of confidential information disclosed in the context of: {{scop_nda}}</p>\n\n<h2>ART. 2 \u2013 DEFINITION</h2>\n<p>\"Confidential Information\" means any information in any format, including but not limited to: financial data, business strategies, client lists, trade secrets, technical know-how, patents, prototypes.</p>\n\n<h2>ART. 3 \u2013 OBLIGATIONS</h2>\n<ul>\n<li>Not to disclose Confidential Information to third parties</li>\n<li>To use Confidential Information solely for the purpose stated in Art. 1</li>\n<li>To take reasonable protection measures</li>\n<li>To limit access to employees with a need-to-know basis</li>\n</ul>\n\n<h2>ART. 4 \u2013 DURATION</h2>\n<p>Confidentiality obligations shall remain in force for <strong>{{durata_nda}} years</strong> from the date of signing.</p>\n\n<h2>ART. 5 \u2013 PENALTIES</h2>\n<p>Breach entitles the aggrieved party to damages of <strong>{{penalitate}} {{moneda}}</strong>, without prejudice to additional proven damages.</p>\n\n<h2>ART. 6 \u2013 GOVERNING LAW</h2>\n<p>This agreement is governed by Romanian law.</p>"
        };

        var ndaFields = new List<DocumentTemplateField>
        {
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "data_acord", Label = "Data acordului", LabelEn = "Agreement date", FieldType = TemplateFieldType.Date, SortOrder = 1, Section = "General", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "parte1_nume", Label = "Denumire Partea 1", LabelEn = "Party 1 name", FieldType = TemplateFieldType.Text, SortOrder = 2, Section = "Partea 1", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "parte1_adresa", Label = "Adresa Partea 1", LabelEn = "Party 1 address", FieldType = TemplateFieldType.Address, SortOrder = 3, Section = "Partea 1", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "parte1_cui", Label = "CUI Partea 1", LabelEn = "Party 1 Tax ID", FieldType = TemplateFieldType.Cui, SortOrder = 4, Section = "Partea 1", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "parte1_reprezentant", Label = "Reprezentant Partea 1", LabelEn = "Party 1 representative", FieldType = TemplateFieldType.Text, SortOrder = 5, Section = "Partea 1", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "parte2_nume", Label = "Denumire Partea 2", LabelEn = "Party 2 name", FieldType = TemplateFieldType.Text, SortOrder = 6, Section = "Partea 2", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "parte2_adresa", Label = "Adresa Partea 2", LabelEn = "Party 2 address", FieldType = TemplateFieldType.Address, SortOrder = 7, Section = "Partea 2", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "parte2_cui", Label = "CUI Partea 2", LabelEn = "Party 2 Tax ID", FieldType = TemplateFieldType.Cui, SortOrder = 8, Section = "Partea 2", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "parte2_reprezentant", Label = "Reprezentant Partea 2", LabelEn = "Party 2 representative", FieldType = TemplateFieldType.Text, SortOrder = 9, Section = "Partea 2", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "scop_nda", Label = "Scopul NDA", LabelEn = "Purpose of NDA", FieldType = TemplateFieldType.TextArea, SortOrder = 10, Section = "Condi\u021bii", IsRequired = true, HelpText = "Descrie\u021bi contextul schimbului de informa\u021bii (ex: evaluarea unui parteneriat, due diligence)", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "durata_nda", Label = "Durata (ani)", LabelEn = "Duration (years)", FieldType = TemplateFieldType.Number, SortOrder = 11, Section = "Condi\u021bii", IsRequired = true, DefaultValue = "3", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "penalitate", Label = "Penalitate (suma)", LabelEn = "Penalty (amount)", FieldType = TemplateFieldType.Currency, SortOrder = 12, Section = "Condi\u021bii", IsRequired = true, DefaultValue = "50000", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplNda.Id, FieldKey = "moneda", Label = "Moneda", LabelEn = "Currency", FieldType = TemplateFieldType.SingleChoice, SortOrder = 13, Section = "Condi\u021bii", IsRequired = true, OptionsJson = "[\"EUR\",\"RON\",\"USD\"]", DefaultValue = "EUR", CreatedAt = now },
        };

        tplNda.Fields = ndaFields;
        context.DocumentTemplates.Add(tplNda);
        await context.SaveChangesAsync();

        context.TemplateClauseMappings.AddRange(
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplNda.Id, ClauseId = clauseJurisdict.Id, SortOrder = 1, IsRequired = true, CreatedAt = now },
            new TemplateClauseMapping { Id = Guid.NewGuid(), TemplateId = tplNda.Id, ClauseId = clauseCesiune.Id, SortOrder = 2, IsRequired = false, CreatedAt = now }
        );
        await context.SaveChangesAsync();

        // Template 4: Procura generala

        var tplProcura = new DocumentTemplate
        {
            Id = Guid.Parse("A0000000-0000-0000-0000-000000000004"),
            FirmId = TestFirmId,
            Name = "Procur\u0103 general\u0103",
            Description = "Procur\u0103 general\u0103 pentru reprezentare \u00een fa\u021ba autorit\u0103\u021bilor \u0219i institu\u021biilor. Necesit\u0103 autentificare notarial\u0103.",
            Category = DocumentCategory.PowerOfAttorney,
            PracticeArea = PracticeArea.Civil,
            Language = DocumentLanguage.Romanian,
            EstimatedMinutes = 5,
            Tags = "procur\u0103,reprezentare,notar",
            IsActive = true,
            IsSystemTemplate = true,
            Version = 1,
            CreatedAt = now,
            BodyTemplate = "<h1 style=\"text-align:center\">PROCUR\u0102 GENERAL\u0102</h1>\n\n<p>Subsemnatul/Subsemnata <strong>{{mandant_nume}}</strong>, CNP <strong>{{mandant_cnp}}</strong>, domiciliat(\u0103) \u00een {{mandant_adresa}}, posesor/posesoare al/a CI seria {{mandant_ci_seria}} nr. {{mandant_ci_nr}}, eliberat(\u0103) de {{mandant_ci_emitent}} la data de {{mandant_ci_data}},</p>\n\n<p>\u00eemputernicesc prin prezenta pe <strong>{{mandatar_nume}}</strong>, CNP <strong>{{mandatar_cnp}}</strong>, domiciliat(\u0103) \u00een {{mandatar_adresa}}, posesor/posesoare al/a CI seria {{mandatar_ci_seria}} nr. {{mandatar_ci_nr}},</p>\n\n<p>s\u0103 m\u0103 represinte cu puteri depline \u00een fa\u021ba oric\u0103ror autorit\u0103\u021bi, institu\u021bii publice sau private, persoane fizice sau juridice, \u00een vederea:</p>\n\n<ul>\n<li>{{scop_procura}}</li>\n</ul>\n\n<p>\u00CEN acest scop, mandatarul va putea semna \u00een numele meu orice documente necesare, va putea depune \u0219i ridica acte, va putea efectua pl\u0103\u021bi \u0219i va putea \u00eentreprinde orice demersuri legale necesare \u00eendeplinirii prezentului mandat.</p>\n\n<p>Prezenta procur\u0103 este valabil\u0103 pentru o perioad\u0103 de <strong>{{valabilitate}}</strong> de la data autentific\u0103rii.</p>\n\n<p style=\"margin-top:2rem\"><strong>MANDANT:</strong><br/>{{mandant_nume}}<br/><br/>Data: ____________<br/>Semn\u0103tura: ____________</p>"
        };

        var procuraFields = new List<DocumentTemplateField>
        {
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandant_nume", Label = "Numele mandantului", FieldType = TemplateFieldType.Text, SortOrder = 1, Section = "Mandant", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandant_cnp", Label = "CNP mandant", FieldType = TemplateFieldType.Cnp, SortOrder = 2, Section = "Mandant", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandant_adresa", Label = "Adresa mandantului", FieldType = TemplateFieldType.Address, SortOrder = 3, Section = "Mandant", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandant_ci_seria", Label = "Seria CI mandant", FieldType = TemplateFieldType.Text, SortOrder = 4, Section = "Mandant", IsRequired = true, HelpText = "Ex: RD", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandant_ci_nr", Label = "Num\u0103r CI mandant", FieldType = TemplateFieldType.Text, SortOrder = 5, Section = "Mandant", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandant_ci_emitent", Label = "CI emis\u0103 de", FieldType = TemplateFieldType.Text, SortOrder = 6, Section = "Mandant", IsRequired = true, HelpText = "Ex: SPCEP Sector 1", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandant_ci_data", Label = "Data emiterii CI", FieldType = TemplateFieldType.Date, SortOrder = 7, Section = "Mandant", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandatar_nume", Label = "Numele mandatarului", FieldType = TemplateFieldType.Text, SortOrder = 8, Section = "Mandatar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandatar_cnp", Label = "CNP mandatar", FieldType = TemplateFieldType.Cnp, SortOrder = 9, Section = "Mandatar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandatar_adresa", Label = "Adresa mandatarului", FieldType = TemplateFieldType.Address, SortOrder = 10, Section = "Mandatar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandatar_ci_seria", Label = "Seria CI mandatar", FieldType = TemplateFieldType.Text, SortOrder = 11, Section = "Mandatar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "mandatar_ci_nr", Label = "Num\u0103r CI mandatar", FieldType = TemplateFieldType.Text, SortOrder = 12, Section = "Mandatar", IsRequired = true, CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "scop_procura", Label = "Scopul procurii", FieldType = TemplateFieldType.TextArea, SortOrder = 13, Section = "Detalii", IsRequired = true, HelpText = "Descrie\u021bi ac\u021biunile pe care mandatarul le poate \u00eendeplini", CreatedAt = now },
            new() { Id = Guid.NewGuid(), TemplateId = tplProcura.Id, FieldKey = "valabilitate", Label = "Valabilitate", FieldType = TemplateFieldType.SingleChoice, SortOrder = 14, Section = "Detalii", IsRequired = true, OptionsJson = "[\"6 luni\",\"1 an\",\"2 ani\",\"nelimitat\u0103\"]", DefaultValue = "1 an", CreatedAt = now },
        };

        tplProcura.Fields = procuraFields;
        context.DocumentTemplates.Add(tplProcura);
        await context.SaveChangesAsync();

        Console.WriteLine("\u2705 Document Automation data seeded:");
        Console.WriteLine("   - 4 templates (Contract servicii, \u00CEnchiriere, NDA, Procur\u0103)");
        Console.WriteLine("   - 6 clauses (For\u021b\u0103 major\u0103, Confiden\u021bialitate, Penalitate, GDPR, Jurisdic\u021bie, Cesiune)");
        Console.WriteLine("   - 9 template-clause mappings");
    }
}
