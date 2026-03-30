namespace LegalRO.CaseManagement.Infrastructure.Settings;

public class NotificationSettings
{
    public SendGridSettings SendGrid { get; set; } = new();
    public TwilioSettings Twilio { get; set; } = new();
    public SmtpSettings? Smtp { get; set; }
    public string FirmName { get; set; } = "Cabinet Avocat LegalRO";
    public string FirmEmail { get; set; } = "contact@legalro.ro";
}

public class SendGridSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = false;
}

public class TwilioSettings
{
    public string AccountSid { get; set; } = string.Empty;
    public string AuthToken { get; set; } = string.Empty;
    public string FromPhone { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = false;
}

public class SmtpSettings
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1025;
    public bool IsEnabled { get; set; } = false;
    public string? Username { get; set; }
    public string? Password { get; set; }
}
