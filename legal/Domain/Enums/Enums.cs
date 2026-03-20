namespace LegalRO.CaseManagement.Domain.Enums;

/// <summary>
/// Case status enumeration
/// </summary>
public enum CaseStatus
{
    Active = 1,
    Pending = 2,
    Closed = 3,
    OnHold = 4
}

/// <summary>
/// Practice area enumeration for Romanian law
/// </summary>
public enum PracticeArea
{
    Civil = 1,
    Commercial = 2,
    Criminal = 3,
    Family = 4,
    RealEstate = 5,
    Labor = 6,
    Corporate = 7,
    Administrative = 8,
    Other = 9
}

/// <summary>
/// Case type enumeration
/// </summary>
public enum CaseType
{
    Litigation = 1,
    Consultation = 2,
    Transactional = 3,
    Other = 4
}

/// <summary>
/// Billing arrangement enumeration
/// </summary>
public enum BillingArrangement
{
    Hourly = 1,
    FlatFee = 2,
    Contingency = 3,
    Retainer = 4,
    Hybrid = 5
}

/// <summary>
/// User role enumeration
/// </summary>
public enum UserRole
{
    Admin = 1,
    Lawyer = 2,
    Associate = 3,
    LegalSecretary = 4,
    Client = 5
}

/// <summary>
/// Deadline type enumeration
/// </summary>
public enum DeadlineType
{
    CourtDeadline = 1,      // NCPC procedural deadline
    InternalDeadline = 2,   // Firm internal deadline
    ClientDeadline = 3,     // Client-requested deadline
    StatuteOfLimitations = 4
}

/// <summary>
/// Priority level enumeration
/// </summary>
public enum Priority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

/// <summary>
/// Task status enumeration
/// </summary>
public enum TaskStatus
{
    NotStarted = 1,
    InProgress = 2,
    Completed = 3,
    Blocked = 4
}

/// <summary>
/// Document confidentiality level
/// </summary>
public enum ConfidentialityLevel
{
    Public = 1,
    Internal = 2,
    Confidential = 3,
    Privileged = 4  // Lawyer-client privilege
}

/// <summary>
/// Lead status enumeration for intake pipeline
/// </summary>
public enum LeadStatus
{
    New = 1,                    // Just submitted
    Contacted = 2,              // Initial contact made
    Qualified = 3,              // Passed qualification
    ConsultationScheduled = 4,  // Consultation booked
    ConsultationCompleted = 5,  // Consultation done
    ProposalSent = 6,          // Engagement letter sent
    Converted = 7,             // Became client
    Lost = 8,                  // Did not convert
    Disqualified = 9           // Not a good fit
}

/// <summary>
/// Lead source/channel enumeration
/// </summary>
public enum LeadSource
{
    Website = 1,
    WhatsApp = 2,
    Facebook = 3,
    Instagram = 4,
    Phone = 5,
    Email = 6,
    Referral = 7,
    WalkIn = 8,
    GoogleAds = 9,
    LinkedIn = 10,
    Other = 11
}

/// <summary>
/// Lead urgency level
/// </summary>
public enum LeadUrgency
{
    Low = 1,        // Not urgent
    Medium = 2,     // Within a week
    High = 3,       // Within days
    Emergency = 4   // Immediate (arrested, hearing tomorrow, etc.)
}

/// <summary>
/// Consultation type enumeration
/// </summary>
public enum ConsultationType
{
    InPerson = 1,
    Phone = 2,
    Video = 3
}

/// <summary>
/// Consultation status
/// </summary>
public enum ConsultationStatus
{
    Scheduled = 1,
    Confirmed = 2,
    Completed = 3,
    NoShow = 4,
    Cancelled = 5,
    Rescheduled = 6
}

/// <summary>
/// Conflict check status
/// </summary>
public enum ConflictCheckStatus
{
    Pending = 1,
    NoConflict = 2,
    ConflictDetected = 3,
    WaiverRequested = 4,
    WaiverObtained = 5,
    Declined = 6
}

/// <summary>
/// Conflict type enumeration
/// </summary>
public enum ConflictType
{
    DirectConflict = 1,      // Firm represents opposing party
    ConcurrentConflict = 2,  // Competing interests
    FormerClientConflict = 3,// Related to prior representation
    ImputedConflict = 4      // Another lawyer in firm has conflict
}

/// <summary>
/// Campaign type enumeration
/// </summary>
public enum CampaignType
{
    Email = 1,
    SMS = 2,
    WhatsApp = 3,
    Mixed = 4
}

/// <summary>
/// Campaign status
/// </summary>
public enum CampaignStatus
{
    Draft = 1,
    Active = 2,
    Paused = 3,
    Completed = 4,
    Archived = 5
}

/// <summary>
/// Message channel enumeration
/// </summary>
public enum MessageChannel
{
    Email = 1,
    SMS = 2,
    WhatsApp = 3,
    Phone = 4,
    FacebookMessenger = 5,
    InstagramDM = 6
}

// ?? Document Automation Enums ????????????????????????????????????????

/// <summary>
/// Category of legal document template
/// </summary>
public enum DocumentCategory
{
    // Contracts & Agreements
    SalesPurchaseAgreement = 1,
    ServiceAgreement = 2,
    EmploymentContract = 3,
    NonDisclosureAgreement = 4,
    LeaseAgreement = 5,
    LoanAgreement = 6,
    PartnershipAgreement = 7,
    FranchiseAgreement = 8,

    // Court Documents
    Complaint = 20,
    Motion = 21,
    Appeal = 22,
    ResponseToComplaint = 23,
    EvidenceList = 24,

    // Corporate Documents
    ArticlesOfIncorporation = 40,
    ShareholderAgreement = 41,
    BoardResolution = 42,
    GdprComplianceDocument = 43,
    PrivacyPolicy = 44,
    TermsOfService = 45,

    // Other
    PowerOfAttorney = 60,
    WillAndTestament = 61,
    DemandLetter = 62,
    SettlementAgreement = 63,
    Other = 99
}

/// <summary>
/// Template field / interview question type
/// </summary>
public enum TemplateFieldType
{
    Text = 1,
    TextArea = 2,
    Number = 3,
    Currency = 4,
    Date = 5,
    Boolean = 6,
    SingleChoice = 7,
    MultipleChoice = 8,
    Email = 9,
    Phone = 10,
    Cnp = 11,           // Romanian personal ID
    Cui = 12,            // Romanian fiscal code
    Address = 13
}

/// <summary>
/// Risk rating for a clause
/// </summary>
public enum ClauseRiskLevel
{
    Favorable = 1,
    Neutral = 2,
    Unfavorable = 3
}

/// <summary>
/// Status of a document generation session (interview)
/// </summary>
public enum DocumentSessionStatus
{
    InProgress = 1,
    Completed = 2,
    Abandoned = 3
}

/// <summary>
/// Language of the generated document
/// </summary>
public enum DocumentLanguage
{
    Romanian = 1,
    English = 2,
    Bilingual = 3
}

// ?? Billing & Financial Management Enums ????????????????????????

/// <summary>
/// Invoice status
/// </summary>
public enum InvoiceStatus
{
    Draft = 1,
    Sent = 2,
    Viewed = 3,
    PartiallyPaid = 4,
    Paid = 5,
    Overdue = 6,
    Cancelled = 7,
    WrittenOff = 8
}

/// <summary>
/// Currency codes used in the Romanian legal market
/// </summary>
public enum Currency
{
    RON = 1,
    EUR = 2,
    USD = 3
}

/// <summary>
/// Time entry status
/// </summary>
public enum TimeEntryStatus
{
    Draft = 1,
    Submitted = 2,
    Approved = 3,
    Billed = 4,
    WrittenOff = 5
}

/// <summary>
/// Expense status
/// </summary>
public enum ExpenseStatus
{
    Pending = 1,
    Approved = 2,
    Billed = 3,
    Rejected = 4,
    WrittenOff = 5
}

/// <summary>
/// Expense category for law firms
/// </summary>
public enum ExpenseCategory
{
    CourtFees = 1,
    FilingCosts = 2,
    TravelMileage = 3,
    TravelAccommodation = 4,
    TravelMeals = 5,
    Postage = 6,
    Copying = 7,
    Courier = 8,
    ExpertWitness = 9,
    ProcessService = 10,
    TranslationNotarisation = 11,
    ResearchDatabases = 12,
    Other = 99
}

/// <summary>
/// Trust account transaction type
/// </summary>
public enum TrustTransactionType
{
    Deposit = 1,
    Withdrawal = 2,
    Transfer = 3,
    InterestCredit = 4,
    BankFee = 5,
    RefundToClient = 6
}

/// <summary>
/// Payment method
/// </summary>
public enum PaymentMethod
{
    BankTransfer = 1,
    CreditCard = 2,
    Cash = 3,
    OnlinePayment = 4,  // Stripe / PayU
    TrustAccountTransfer = 5,
    Check = 6
}
