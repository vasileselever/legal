using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.API.Helpers;

/// <summary>
/// Converts PracticeArea enum values to Romanian display labels.
/// Use ToRomanianLabel() everywhere a human-readable name is needed
/// (emails, notifications, reports) — never use .ToString() which
/// returns the English enum member name (e.g. "Criminal", "Family").
/// </summary>
public static class PracticeAreaExtensions
{
    public static string ToRomanianLabel(this PracticeArea area) => area switch
    {
        PracticeArea.Civil          => "Drept Civil",
        PracticeArea.Commercial     => "Drept Comercial",
        PracticeArea.Criminal       => "Drept Penal",
        PracticeArea.Family         => "Dreptul Familiei",
        PracticeArea.RealEstate     => "Drept Imobiliar",
        PracticeArea.Labor          => "Dreptul Muncii",
        PracticeArea.Corporate      => "Drept Corporativ",
        PracticeArea.Administrative => "Drept Administrativ",
        PracticeArea.Other          => "Altul",
        _                           => area.ToString()
    };
}
