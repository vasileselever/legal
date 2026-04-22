using System.Security.Claims;

namespace LegalRO.CaseManagement.API.Helpers;

/// <summary>
/// Helper to extract user/firm identity from JWT claims
/// </summary>
public static class ClaimsHelper
{
    public const string FirmIdClaim  = "firm_id";
    public const string UserIdClaim  = "sub";
    public const string RoleClaim    = "role";

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

    /// <summary>
    /// Returns true when the authenticated user has the SuperAdmin role.
    /// SuperAdmin is cross-tenant and bypasses firm-scoping on all resources.
    /// </summary>
    public static bool IsSuperAdmin(ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(RoleClaim);
        return claim == "SuperAdmin" || claim == "0";
    }

    /// <summary>
    /// Returns true when the caller is either SuperAdmin or Admin within their firm.
    /// </summary>
    public static bool IsAdminOrAbove(ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(RoleClaim);
        return claim is "SuperAdmin" or "0" or "Admin" or "1";
    }
}
