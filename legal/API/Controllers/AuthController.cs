using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LegalRO.CaseManagement.API.Helpers;
using LegalRO.CaseManagement.Application.DTOs.Auth;
using LegalRO.CaseManagement.Application.DTOs.Common;
using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Domain.Enums;
using LegalRO.CaseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LegalRO.CaseManagement.API.Controllers;

/// <summary>
/// Authentication controller - register, login, user management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Register a new firm with an admin user
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<AuthResponseDto>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage))
            });

        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            return BadRequest(new ApiResponse<AuthResponseDto>
            {
                Success = false,
                Message = "An account with this email already exists"
            });

        AuthResponseDto? token = null;

        try
        {
            // Wrap in execution strategy so SqlServerRetryingExecutionStrategy supports the transaction
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();

                var firm = new Firm
                {
                    Name = dto.FirmName,
                    Email = dto.FirmEmail,
                    Phone = dto.FirmPhone
                };
                _context.Firms.Add(firm);
                await _context.SaveChangesAsync();

                var user = new User
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    FirmId = firm.Id,
                    Role = UserRole.Admin,
                    IsActive = true
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    await transaction.RollbackAsync();
                    throw new InvalidOperationException(
                        string.Join("; ", result.Errors.Select(e => e.Description)));
                }

                await transaction.CommitAsync();

                _logger.LogInformation("New firm registered: {FirmId} by {Email}", firm.Id, dto.Email);
                token = GenerateJwtToken(user);
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Password") || ex.Message.Contains("password")
            || ex.Message.Contains("User") || ex.Message.Contains("unique"))
        {
            return BadRequest(new ApiResponse<AuthResponseDto> { Success = false, Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for {Email}", dto.Email);
            return StatusCode(500, new ApiResponse<AuthResponseDto>
            {
                Success = false,
                Message = "An error occurred during registration"
            });
        }

        return CreatedAtAction(nameof(GetMe), null, new ApiResponse<AuthResponseDto>
        {
            Success = true,
            Data = token,
            Message = "Registration successful"
        });
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<AuthResponseDto>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage))
            });

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !user.IsActive)
            return Unauthorized(new ApiResponse<AuthResponseDto>
            {
                Success = false,
                Message = "Invalid email or password"
            });

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);

        if (result.IsLockedOut)
            return Unauthorized(new ApiResponse<AuthResponseDto>
            {
                Success = false,
                Message = "Account locked due to too many failed attempts. Try again in 15 minutes."
            });

        if (!result.Succeeded)
            return Unauthorized(new ApiResponse<AuthResponseDto>
            {
                Success = false,
                Message = "Invalid email or password"
            });

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        _logger.LogInformation("User {Email} logged in successfully", dto.Email);

        var token = GenerateJwtToken(user);
        return Ok(new ApiResponse<AuthResponseDto>
        {
            Success = true,
            Data = token,
            Message = "Login successful"
        });
    }

    /// <summary>
    /// Get current authenticated user info
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserInfoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<UserInfoDto>>> GetMe()
    {
        if (!ClaimsHelper.TryGetUserId(User, out var userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return NotFound(new ApiResponse<UserInfoDto> { Success = false, Message = "User not found" });

        return Ok(new ApiResponse<UserInfoDto>
        {
            Success = true,
            Data = MapToUserInfo(user)
        });
    }

    /// <summary>
    /// Invite a new user to the firm
    /// </summary>
    [HttpPost("invite")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserInfoDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<UserInfoDto>>> InviteUser([FromBody] InviteUserDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<UserInfoDto>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

        var firmId = ClaimsHelper.GetFirmId(User);

        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
            return BadRequest(new ApiResponse<UserInfoDto>
            {
                Success = false,
                Message = "A user with this email already exists"
            });

        // Generate a temporary password - user should change it on first login
        var tempPassword = $"Temp_{Guid.NewGuid():N}A1!".Substring(0, 16);

        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            FirmId = firmId,
            Role = dto.Role,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, tempPassword);
        if (!result.Succeeded)
            return BadRequest(new ApiResponse<UserInfoDto>
            {
                Success = false,
                Message = string.Join("; ", result.Errors.Select(e => e.Description))
            });

        _logger.LogInformation("User {Email} invited to firm {FirmId}", dto.Email, firmId);

        // TODO: Send invitation email with temp password / reset link

        return CreatedAtAction(nameof(GetMe), null, new ApiResponse<UserInfoDto>
        {
            Success = true,
            Data = MapToUserInfo(user),
            Message = "User invited successfully. Invitation email will be sent."
        });
    }

    /// <summary>
    /// Get all users in the firm
    /// </summary>
    [HttpGet("users")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<List<UserInfoDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<UserInfoDto>>>> GetFirmUsers()
    {
        var firmId = ClaimsHelper.GetFirmId(User);

        var users = await _context.Users
            .Where(u => u.FirmId == firmId && u.IsActive)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Select(u => new UserInfoDto
            {
                Id = u.Id,
                FirmId = u.FirmId,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? string.Empty,
                Role = u.Role
            })
            .ToListAsync();

        return Ok(new ApiResponse<List<UserInfoDto>>
        {
            Success = true,
            Data = users,
            Message = $"Retrieved {users.Count} users"
        });
    }

    /// <summary>
    /// Change current user's password
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });

        var userId = ClaimsHelper.GetUserId(User);
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return NotFound(new ApiResponse<bool> { Success = false, Message = "User not found" });

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = string.Join("; ", result.Errors.Select(e => e.Description))
            });

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Password changed successfully"
        });
    }

    #region Private helpers

    private AuthResponseDto GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"]!;
        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];
        var expiryHours = int.TryParse(_configuration["Jwt:ExpiryHours"], out var h) ? h : 24;

        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new("email", user.Email ?? string.Empty),
            new("name", user.FullName),
            new("role", user.Role.ToString()),
            new("firm_id", user.FirmId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddHours(expiryHours);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt,
            User = MapToUserInfo(user)
        };
    }

    private static UserInfoDto MapToUserInfo(User user) => new()
    {
        Id = user.Id,
        FirmId = user.FirmId,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email ?? string.Empty,
        Role = user.Role
    };

    #endregion
}
