using System.Diagnostics;
using System.Text;
using System.Text.Json;
using Azure.AI.OpenAI;
using LegalRO.CaseManagement.Application.DTOs.LegalResearch;
using LegalRO.CaseManagement.Application.Services;
using OpenAI.Chat;

namespace LegalRO.CaseManagement.Infrastructure.Services;

/// <summary>
/// AI Legal Research service.
/// Uses Azure OpenAI when Ai:AzureOpenAI:Endpoint is configured; falls back to
/// a structured mock so the feature works out-of-the-box without Azure credentials.
/// </summary>
public class LegalResearchService : ILegalResearchService
{
    private readonly IConfiguration _cfg;
    private readonly ILogger<LegalResearchService> _logger;

    public LegalResearchService(IConfiguration cfg, ILogger<LegalResearchService> logger)
    {
        _cfg    = cfg;
        _logger = logger;
    }

    public async Task<LegalResearchResultDto> SearchAsync(
        string query,
        string? practiceAreaHint,
        string? caseContext,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();

        var endpoint  = _cfg["Ai:AzureOpenAI:Endpoint"];
        var apiKey    = _cfg["Ai:AzureOpenAI:ApiKey"];
        var deployment = _cfg["Ai:AzureOpenAI:Deployment"] ?? "gpt-4o";

        if (!string.IsNullOrWhiteSpace(endpoint) && !string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                return await CallAzureOpenAiAsync(
                    query, practiceAreaHint, caseContext, endpoint, apiKey, deployment, sw, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Azure OpenAI call failed; falling back to mock");
            }
        }

        return await BuildMockResponseAsync(query, practiceAreaHint, sw);
    }

    // >> Azure OpenAI >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    private async Task<LegalResearchResultDto> CallAzureOpenAiAsync(
        string query, string? area, string? caseCtx,
        string endpoint, string apiKey, string deployment,
        Stopwatch sw, CancellationToken ct)
    {
        var client = new AzureOpenAIClient(new Uri(endpoint), new Azure.AzureKeyCredential(apiKey));
        var chat   = client.GetChatClient(deployment);

        var systemPrompt = BuildSystemPrompt();
        var userPrompt   = BuildUserPrompt(query, area, caseCtx);

        var messages = new List<ChatMessage>
        {
            ChatMessage.CreateSystemMessage(systemPrompt),
            ChatMessage.CreateUserMessage(userPrompt),
        };

        var options = new ChatCompletionOptions
        {
            Temperature          = 0.2f,
            MaxOutputTokenCount  = 2048,
        };

        var completion = await chat.CompleteChatAsync(messages, options, ct);
        var rawJson    = completion.Value.Content[0].Text;

        sw.Stop();
        return ParseAiResponse(query, rawJson, area, (int)sw.Elapsed.TotalMilliseconds, deployment);
    }

    // >> Prompt helpers >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    private static string BuildSystemPrompt() =>
"""
        Esti un asistent juridic AI specializat pe dreptul roman.
        Raspunzi EXCLUSIV la intrebari juridice referitoare la legislatia romana.
        Raspunsul tau trebuie sa fie un JSON valid cu exact urmatoarea structura:
        {
          "answer": "<raspuns detaliat in Markdown, in romana>",
          "confidence": <numar 0-100>,
          "sources": [
            {
              "title": "<titlu sursa>",
              "type": "<Lege|Hotarare|Jurisprudenta|Doctrina>",
              "reference": "<referinta specifica, ex: Art. 1357 Cod Civil>",
              "url": "<url optional>",
              "excerpt": "<citat relevant, max 200 caractere>",
              "publishedDate": "<YYYY optional>",
              "relevance": <0-100>
            }
          ]
        }
        Citeaza cel putin 3 surse relevante. Fii precis si citeaza articole exacte.
        Nu inventa legi care nu exista.
        """;

    private static string BuildUserPrompt(string query, string? area, string? caseCtx)
    {
        var sb = new StringBuilder();
        if (!string.IsNullOrWhiteSpace(area))   sb.AppendLine($"Domeniu juridic: {area}");
        if (!string.IsNullOrWhiteSpace(caseCtx)) sb.AppendLine($"Context dosar: {caseCtx}");
        sb.AppendLine();
        sb.AppendLine($"Intrebare: {query}");
        return sb.ToString();
    }

    // >> Parse AI JSON response >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    private static LegalResearchResultDto ParseAiResponse(
        string query, string rawJson, string? area, int ms, string model)
    {
        // Strip ```json ... ``` fences if present
        var json = rawJson.Trim();
        if (json.StartsWith("```"))
        {
            var start = json.IndexOf('{');
            var end   = json.LastIndexOf('}');
            json = start >= 0 && end > start ? json.Substring(start, end - start + 1) : json;
        }

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var answer     = root.GetProperty("answer").GetString() ?? string.Empty;
        var confidence = root.TryGetProperty("confidence", out var c) ? c.GetInt32() : 75;
        var sources    = new List<LegalSourceDto>();

        if (root.TryGetProperty("sources", out var srcArr) && srcArr.ValueKind == JsonValueKind.Array)
        {
            foreach (var s in srcArr.EnumerateArray())
            {
                sources.Add(new LegalSourceDto
                {
                    Title         = s.TryGetProperty("title",         out var t)   ? t.GetString()   ?? "" : "",
                    Type          = s.TryGetProperty("type",          out var ty)  ? ty.GetString()  ?? "" : "",
                    Reference     = s.TryGetProperty("reference",     out var r)   ? r.GetString()        : null,
                    Url           = s.TryGetProperty("url",           out var u)   ? u.GetString()        : null,
                    Excerpt       = s.TryGetProperty("excerpt",       out var ex)  ? ex.GetString()       : null,
                    PublishedDate = s.TryGetProperty("publishedDate", out var pd)  ? pd.GetString()       : null,
                    Relevance     = s.TryGetProperty("relevance",     out var rel) ? rel.GetInt32()       : 80,
                });
            }
        }

        return new LegalResearchResultDto
        {
            Query          = query,
            Answer         = answer,
            Sources        = sources,
            ConfidenceScore = confidence,
            ProcessingMs   = ms,
            ModelUsed      = model,
            CreatedAt      = DateTime.UtcNow,
        };
    }

    // >> Structured mock (no Azure credentials required) >>>>>>>>>>>>>>

    private static Task<LegalResearchResultDto> BuildMockResponseAsync(
        string query, string? area, Stopwatch sw)
    {
        sw.Stop();
        var lq = query.ToLowerInvariant();

        // Pick a thematic mock based on keywords
        var (answer, sources) = lq.Contains("concedier") || lq.Contains("munc")
            ? MockLabor()
            : lq.Contains("divor") || lq.Contains("familie") || lq.Contains("custodie")
            ? MockFamily()
            : lq.Contains("raspund") || lq.Contains("daun") || lq.Contains("delict")
            ? MockCivil()
            : lq.Contains("penal") || lq.Contains("infract") || lq.Contains("arest")
            ? MockCriminal()
            : lq.Contains("contract") || lq.Contains("comerci")
            ? MockCommercial()
            : MockGeneral(query);

        var result = new LegalResearchResultDto
        {
            Query           = query,
            Answer          = answer,
            Sources         = sources,
            ConfidenceScore = 72,
            ProcessingMs    = (int)sw.Elapsed.TotalMilliseconds + 400,
            ModelUsed       = "mock-ro-legal-v1",
            CreatedAt       = DateTime.UtcNow,
        };
        return Task.FromResult(result);
    }

    // >> Mock templates >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    private static (string, List<LegalSourceDto>) MockLabor() => ("""
        ## Concedierea in Dreptul Muncii Roman

        Potrivit **art. 55 din Codul Muncii (Legea nr. 53/2003)**, contractul individual de munca
        poate inceta de drept, prin acordul partilor sau prin actul unilateral al uneia dintre parti.

        ### Concedierea pentru motive ce tin de persoana salariatului
        Art. 61 permite concedierea pentru:
        - **Abateri disciplinare grave** (lit. a) - necesita cercetare disciplinara prealabila (art. 251)
        - **Arest preventiv > 30 zile** (lit. b)
        - **Inaptitudine fizica/psihica** constatata prin decizie medicala (lit. c)
        - **Necorespundere profesionala** (lit. d) - necesita evaluare prealabila

        ### Procedura obligatorie
        1. Cercetare disciplinara prealabila (art. 251-252)
        2. Emiterea deciziei de concediere in scris (art. 62)
        3. Respectarea termenului de preaviz: **minim 20 zile lucratoare** (art. 75)

        ### Nulitatea absoluta (art. 60)
        Concedierea este interzisa in urmatoarele situatii: concediu medical, maternitate,
        crestere copil, vacanta anuala platita.

        > **Nota:** Aceasta este o analiza generala. Consultati un avocat specializat pentru speta concreta.
        """,
        new List<LegalSourceDto>
        {
            new() { Title="Codul Muncii", Type="Lege", Reference="Art. 55-79", Url="https://legislatie.just.ro/Public/DetaliiDocument/63996", Excerpt="Incetarea contractului individual de munca", Relevance=95 },
            new() { Title="Legea nr. 53/2003 - Codul Muncii", Type="Lege", Reference="Art. 251-252", Excerpt="Cercetarea disciplinara prealabila", Relevance=90, PublishedDate="2003" },
            new() { Title="Decizia ICCJ nr. 16/2021", Type="Jurisprudenta", Reference="RIL", Excerpt="Procedura cercetarii disciplinare - interpretare unitara", Relevance=80 },
        });

    private static (string, List<LegalSourceDto>) MockFamily() => ("""
        ## Divortul si Custodia Copilului in Dreptul Roman

        **Codul Civil (Legea nr. 287/2009)** reglementeaza divortul in **art. 373-404**.

        ### Modalitati de divort
        | Modalitate | Temei legal | Conditii |
        |---|---|---|
        | Prin acordul sotilor | Art. 374 | Casatorie min. 1 an, copii minori sau nu |
        | La cererea unuia | Art. 379 | Ruptura grava a casatoriei |
        | Din culpa | Art. 379 alin. 2 | Fapte imputabile celuilalt sot |
        | Separare faptica | Art. 380 | Min. 2 ani de separare |

        ### Autoritatea parinteasca (art. 483-512)
        Dupa divort, **autoritatea parinteasca se exercita in comun** de ambii parinti (art. 397),
        cu exceptia cazurilor in care interesul superior al copilului impune altfel.

        **Locuinta copilului** se stabileste la unul dintre parinti; celalalt are drept de vizita.

        ### Pensia de intretinere (art. 529-533)
        - **Cuantum**: 1/4 din venitul net pentru un copil, 1/3 pentru doi, 1/2 pentru trei sau mai multi
        - **Executare silita** prin poprire pe salariu

        > **Nota:** Analiza generala. Recomandam consultarea unui avocat de dreptul familiei.
        """,
        new List<LegalSourceDto>
        {
            new() { Title="Codul Civil", Type="Lege", Reference="Art. 373-404", Url="https://legislatie.just.ro/Public/DetaliiDocument/109884", Excerpt="Desfacerea casatoriei prin divort", Relevance=97, PublishedDate="2009" },
            new() { Title="Codul Civil", Type="Lege", Reference="Art. 483-512", Excerpt="Autoritatea parinteasca si locuinta minorului", Relevance=93 },
            new() { Title="Legea nr. 272/2004", Type="Lege", Reference="Protectia drepturilor copilului", Excerpt="Interesul superior al copilului in procedurile judiciare", Relevance=85, PublishedDate="2004" },
            new() { Title="Decizia CC nr. 486/2020", Type="Jurisprudenta", Reference="Curtea Constitutionala", Excerpt="Constitutionalitatea art. 396 Cod Civil", Relevance=75 },
        });

    private static (string, List<LegalSourceDto>) MockCivil() => ("""
        ## Raspunderea Civila Delictuala in Dreptul Roman

        **Art. 1349-1395 din Codul Civil** (Legea nr. 287/2009) reglementeaza raspunderea civila delictuala.

        ### Conditiile angajarii raspunderii (art. 1357)
        1. **Fapta ilicita** - actiune sau inactiune contrara dreptului
        2. **Prejudiciul** - cert, direct, personal si nereparat
        3. **Legatura de cauzalitate** intre fapta si prejudiciu
        4. **Vinovatia** - intentie sau culpa (inclusiv culpa cea mai usage)

        ### Tipuri de raspundere
        - **Art. 1372** - Raspunderea pentru fapta altei persoane (comitent-prepus)
        - **Art. 1375** - Raspunderea pentru prejudiciile cauzate de animale
        - **Art. 1376** - Raspunderea pentru ruina edificiului
        - **Art. 1380** - Raspunderea pentru produse cu defecte

        ### Evaluarea prejudiciului (art. 1385-1395)
        Victima are dreptul la repararea **integrala** a prejudiciului, incluzand:
        - Pierderea suferita (*damnum emergens*)
        - Beneficiul nerealizat (*lucrum cessans*)
        - Prejudiciul moral (art. 1391)

        > **Nota:** Analiza generala bazata pe dreptul comun.
        """,
        new List<LegalSourceDto>
        {
            new() { Title="Codul Civil - Raspundere delictuala", Type="Lege", Reference="Art. 1349-1395", Url="https://legislatie.just.ro/Public/DetaliiDocument/109884", Excerpt="Obligatia de reparare a prejudiciului cauzat prin fapta proprie", Relevance=98, PublishedDate="2009" },
            new() { Title="Codul Civil", Type="Lege", Reference="Art. 1357", Excerpt="Conditiile raspunderii pentru fapta proprie", Relevance=95 },
            new() { Title="ICCJ, Sectia I Civila, dec. nr. 1205/2022", Type="Jurisprudenta", Excerpt="Evaluarea prejudiciului moral in practica judiciara recenta", Relevance=82 },
        });

    private static (string, List<LegalSourceDto>) MockCriminal() => ("""
        ## Drept Penal Roman - Aspecte Generale

        **Codul Penal (Legea nr. 286/2009)** si **Codul de Procedura Penala (Legea nr. 135/2010)**
        constituie cadrul legal fundamental.

        ### Principii fundamentale
        - **Legalitatea incriminarii** (art. 1 CP) - *nullum crimen sine lege*
        - **Legalitatea sanctiunii** (art. 2 CP)
        - **Vinovatia** (art. 16 CP) - intentie directa/indirecta, culpa cu/fara prevedere, praeterintentie

        ### Masuri preventive (art. 202 CPP)
        | Masura | Durata initiala | Organ competent |
        |---|---|---|
        | Retinere | 24 ore | Organul de urmarire |
        | Control judiciar | 60 zile | Judecator de drepturi |
        | Arest la domiciliu | 30 zile | Judecator de drepturi |
        | Arest preventiv | 30 zile | Judecator de drepturi |

        ### Drepturile suspectului/inculpatului (art. 83 CPP)
        Dreptul la aparator ales sau din oficiu, dreptul la tacere, dreptul de a fi informat.

        > **Atentie:** In cauze penale urgenta consultarii unui avocat este critica.
        """,
        new List<LegalSourceDto>
        {
            new() { Title="Codul Penal", Type="Lege", Reference="Legea nr. 286/2009", Url="https://legislatie.just.ro/Public/DetaliiDocument/109855", Excerpt="Principiile si aplicarea legii penale", Relevance=96, PublishedDate="2009" },
            new() { Title="Codul de Procedura Penala", Type="Lege", Reference="Legea nr. 135/2010, Art. 202-222", Excerpt="Masurile preventive", Relevance=93, PublishedDate="2010" },
            new() { Title="Decizia CC nr. 24/2016", Type="Jurisprudenta", Reference="Curtea Constitutionala", Excerpt="Constitutionalitatea arestului preventiv", Relevance=78 },
        });

    private static (string, List<LegalSourceDto>) MockCommercial() => ("""
        ## Drept Comercial - Contracte si Societati

        **Codul Civil (art. 1166-1323)** si **Legea nr. 31/1990** privind societatile reglementeaza
        principalele institutii ale dreptului comercial roman.

        ### Contractul comercial (art. 1166 CC)
        Contractul este acordul de vointe intre doua sau mai multe persoane cu intentia de a
        constitui, modifica sau stinge un raport juridic.

        **Conditii de validitate (art. 1179)**:
        1. Capacitate de a contracta
        2. Consimtamant valabil
        3. Obiect determinat si licit
        4. Cauza licita si morala

        ### Raspunderea contractuala (art. 1530-1548)
        - Daune-interese pentru neexecutare culpabila
        - Clauza penala (art. 1538) - evaluare anticipata
        - Arvuna (art. 1544) - functie confirmatorie sau penalizatoare

        ### Insolvent (Legea nr. 85/2014)
        Procedura de insolventa se deschide la cererea debitorului sau a creditorului cu
        creante > **50.000 RON** (art. 5 pct. 29).

        > **Nota:** Analiza generala. Recomandam audit juridic complet.
        """,
        new List<LegalSourceDto>
        {
            new() { Title="Codul Civil - Contracte", Type="Lege", Reference="Art. 1166-1323", Excerpt="Incheierea, executarea si incetarea contractelor", Relevance=94, PublishedDate="2009" },
            new() { Title="Legea nr. 31/1990 - Societatile", Type="Lege", Reference="Republicata 2004", Url="https://legislatie.just.ro/Public/DetaliiDocument/1760", Excerpt="Constituirea si functionarea societatilor comerciale", Relevance=90, PublishedDate="1990" },
            new() { Title="Legea nr. 85/2014 - Insolventa", Type="Lege", Reference="Art. 5, 66, 70", Excerpt="Procedura generala si simplificata de insolventa", Relevance=80, PublishedDate="2014" },
        });

    private static (string, List<LegalSourceDto>) MockGeneral(string query) => ($"""
        ## Cercetare Juridica: {query.Substring(0, Math.Min(60, query.Length))}...

        Aceasta este o analiza juridica generala bazata pe legislatia romana in vigoare.

        ### Cadrul legal aplicabil
        Legislatia romana este structurata pe **coduri principale**:
        - **Codul Civil** (Legea nr. 287/2009) - drept privat general
        - **Codul Penal** (Legea nr. 286/2009) - drept penal
        - **Codul de Procedura Civila** (Legea nr. 134/2010)
        - **Codul de Procedura Penala** (Legea nr. 135/2010)
        - **Codul Muncii** (Legea nr. 53/2003)

        ### Recomandare
        Pentru intrebarea specificata, va recomandam:
        1. Identificarea domeniului juridic relevant (civil, penal, comercial, muncii etc.)
        2. Consultarea textului legal actualizat pe [Legis.ro](https://lege5.ro) sau
           [Monitorul Oficial](https://monitoruloficial.ro)
        3. Verificarea jurisprudentei ICCJ pe [portal.just.ro](https://portal.just.ro)
        4. Consultarea unui avocat specializat pentru speta concreta

        > **Nota:** Pentru o cercetare mai precisa, specificati domeniul juridic
        > si detalii suplimentare despre situatia juridica.
        """,
        new List<LegalSourceDto>
        {
            new() { Title="Codul Civil", Type="Lege", Reference="Legea nr. 287/2009", Url="https://legislatie.just.ro/Public/DetaliiDocument/109884", Excerpt="Dreptul comun in materie civila", Relevance=70, PublishedDate="2009" },
            new() { Title="Portal Instantelor de Judecata", Type="Jurisprudenta", Url="https://portal.just.ro", Excerpt="Baza de date jurisprudenta nationala", Relevance=65 },
            new() { Title="Monitorul Oficial al Romaniei", Type="Lege", Url="https://monitoruloficial.ro", Excerpt="Publicatia oficiala a legislatiei in vigoare", Relevance=60 },
        });
}
