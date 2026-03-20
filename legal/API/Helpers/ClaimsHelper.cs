using System.Security.Claims;

namespace LegalRO.CaseManagement.API.Helpers;

/// <summary>
/// Helper to extract user/firm identity from JWT claims
/// </summary>
public static class ClaimsHelper
{
    public const string FirmIdClaim = "firm_id";
    public const string UserIdClaim = ClaimTypes.NameIdentifier;

    public static Guid GetFirmId(ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(FirmIdClaim);
        if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var firmId))
            throw new UnauthorizedAccessException("FirmId claim missing or invalid");
        return firmId;
    }

    public static Guid GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(UserIdClaim);
        if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException("UserId claim missing or invalid");
        return userId;
    }

    public static bool TryGetFirmId(ClaimsPrincipal user, out Guid firmId)
    {
        var claim = user.FindFirstValue(FirmIdClaim);
        return Guid.TryParse(claim, out firmId);
    }

    public static bool TryGetUserId(ClaimsPrincipal user, out Guid userId)
    {
        var claim = user.FindFirstValue(UserIdClaim);
        return Guid.TryParse(claim, out userId);
    }
}
