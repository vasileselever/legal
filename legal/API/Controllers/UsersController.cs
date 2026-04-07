using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Application.DTOs.Users;
using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Enums;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// User management controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        UserManager<User> userManager,
        ApplicationDbContext context,
        ILogger<UsersController> logger)
    {
        _userManager = userManager;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all users in firm
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<UserDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetUsers([FromQuery] bool includeInactive = false)
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var query = _context.Users.Where(u => u.FirmId == firmId);
        if (!includeInactive)
            query = query.Where(u => u.IsActive);

        var users = await query
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirmId = u.FirmId,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? string.Empty,
                Role = u.Role,
                ProfilePictureUrl = u.ProfilePictureUrl,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt
            })
            .ToListAsync();

        return Ok(new ApiResponse<List<UserDto>>
        {
            Success = true,
            Data = users,
            Message = $"Retrieved {users.Count} users"
        });
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUser(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var user = await _context.Users
            .Where(u => u.Id == id && u.FirmId == firmId)
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new ApiResponse<UserDto> { Success = false, Message = "User not found" });

        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Data = new UserDto
            {
                Id = user.Id,
                FirmId = user.FirmId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty,
                Role = user.Role,
                ProfilePictureUrl = user.ProfilePictureUrl,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            }
        });
    }

    /// <summary>
    /// Get user statistics
    /// </summary>
    [HttpGet("{id:guid}/stats")]
    [ProducesResponseType(typeof(ApiResponse<UserStatsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<UserStatsDto>>> GetUserStats(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var user = await _context.Users
            .Where(u => u.Id == id && u.FirmId == firmId)
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new ApiResponse<UserStatsDto> { Success = false, Message = "User not found" });

        var stats = new UserStatsDto
        {
            UserId = id,
            CasesResponsible = await _context.Cases.CountAsync(c => c.ResponsibleLawyerId == id && !c.IsDeleted),
            CasesAssigned = await _context.CaseUsers.CountAsync(cu => cu.UserId == id),
            TasksAssigned = await _context.Tasks.CountAsync(t => t.AssignedTo == id && !t.IsDeleted),
            DocumentsUploaded = await _context.Documents.CountAsync(d => d.UploadedBy == id && !d.IsDeleted),
            LastActivity = await _context.Activities
                .Where(a => a.UserId == id)
                .MaxAsync(a => (DateTime?)a.CreatedAt)
        };

        return Ok(new ApiResponse<UserStatsDto> { Success = true, Data = stats });
    }

    /// <summary>
    /// Update user
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var callerId = ClaimsHelper.GetUserId(User);

        // Only admins can update users
        var caller = await _userManager.FindByIdAsync(callerId.ToString());
        if (caller == null || caller.Role != UserRole.Admin)
            return StatusCode(403, new ApiResponse<UserDto> { Success = false, Message = "Nu aveti permisiuni pentru aceasta actiune." });

        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null || user.FirmId != firmId)
            return NotFound(new ApiResponse<UserDto> { Success = false, Message = "User not found" });

        // Prevent changing the role of an Admin user or promoting to Admin
        if (dto.Role.HasValue)
        {
            if (user.Role == UserRole.Admin && dto.Role.Value != UserRole.Admin)
                return BadRequest(new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Cannot change the role of an Admin user"
                });

            if (user.Role != UserRole.Admin && dto.Role.Value == UserRole.Admin)
                return BadRequest(new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Cannot promote a user to Admin role"
                });
        }

        // Update fields if provided
        if (!string.IsNullOrEmpty(dto.FirstName))
            user.FirstName = dto.FirstName;

        if (!string.IsNullOrEmpty(dto.LastName))
            user.LastName = dto.LastName;

        if (!string.IsNullOrEmpty(dto.Email))
        {
            // Check if email is already taken by another user
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null && existingUser.Id != id)
                return BadRequest(new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Email is already in use by another user"
                });

            user.Email = dto.Email;
            user.UserName = dto.Email;
        }

        if (dto.Role.HasValue)
            user.Role = dto.Role.Value;

        if (dto.ProfilePictureUrl != null)
            user.ProfilePictureUrl = dto.ProfilePictureUrl;

        if (dto.IsActive.HasValue)
            user.IsActive = dto.IsActive.Value;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = string.Join("; ", result.Errors.Select(e => e.Description))
            });

        _logger.LogInformation("User {UserId} updated by {AdminId}", id, ClaimsHelper.GetUserId(User));

        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Data = new UserDto
            {
                Id = user.Id,
                FirmId = user.FirmId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty,
                Role = user.Role,
                ProfilePictureUrl = user.ProfilePictureUrl,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            },
            Message = "User updated successfully"
        });
    }

    /// <summary>
    /// Activate user
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> ActivateUser(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var user = await _context.Users
            .Where(u => u.Id == id && u.FirmId == firmId)
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new ApiResponse<bool> { Success = false, Message = "User not found" });

        user.IsActive = true;
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} activated by {AdminId}", id, ClaimsHelper.GetUserId(User));

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "User activated successfully"
        });
    }

    /// <summary>
    /// Deactivate user
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> DeactivateUser(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var adminId = ClaimsHelper.GetUserId(User);

        // Cannot deactivate yourself
        if (id == adminId)
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "You cannot deactivate your own account"
            });

        var user = await _context.Users
            .Where(u => u.Id == id && u.FirmId == firmId)
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new ApiResponse<bool> { Success = false, Message = "User not found" });

        // Cannot deactivate an Admin user
        if (user.Role == UserRole.Admin)
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Cannot deactivate an Admin user"
            });

        user.IsActive = false;
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} deactivated by {AdminId}", id, adminId);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "User deactivated successfully"
        });
    }

    /// <summary>
    /// Reset user password (admin only)
    /// </summary>
    [HttpPost("{id:guid}/reset-password")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<string>>> ResetPassword(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null || user.FirmId != firmId)
            return NotFound(new ApiResponse<string> { Success = false, Message = "User not found" });

        // Generate password reset token
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Generate temporary password
        var tempPassword = $"Temp_{Guid.NewGuid():N}A1!".Substring(0, 16);

        // Reset password
        var result = await _userManager.ResetPasswordAsync(user, token, tempPassword);
        if (!result.Succeeded)
            return BadRequest(new ApiResponse<string>
            {
                Success = false,
                Message = string.Join("; ", result.Errors.Select(e => e.Description))
            });

        _logger.LogInformation("Password reset for user {UserId} by admin {AdminId}", id, ClaimsHelper.GetUserId(User));

        // TODO: Send email with temporary password

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Data = tempPassword,
            Message = "Password reset successfully. Temporary password generated (should be sent via email)"
        });
    }

    /// <summary>
    /// Delete user (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(Guid id)
    {
        var firmId = ClaimsHelper.GetFirmId(User);
        var adminId = ClaimsHelper.GetUserId(User);

        // Cannot delete yourself
        if (id == adminId)
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "You cannot delete your own account"
            });

        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null || user.FirmId != firmId)
            return NotFound(new ApiResponse<bool> { Success = false, Message = "User not found" });

        // Cannot delete an Admin user
        if (user.Role == UserRole.Admin)
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Cannot delete an Admin user"
            });

        // Soft delete by deactivating
        user.IsActive = false;
        await _userManager.UpdateAsync(user);

        _logger.LogInformation("User {UserId} deleted (soft delete) by {AdminId}", id, adminId);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "User deleted successfully"
        });
    }
}
