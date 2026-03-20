using System.ComponentModel.DataAnnotations;
using LegalRO.CaseManagement.Domain.Enums;

namespace LegalRO.CaseManagement.Application.DTOs.Auth;

/// <summary>
/// DTO for user login
/// </summary>
public class LoginDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// DTO for registering a new firm + admin user
/// </summary>
public class RegisterDto
{
    // Firm details
    [Required(ErrorMessage = "Firm name is required")]
    [MaxLength(200)]
    public string FirmName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? FirmPhone { get; set; }

    [EmailAddress]
    [MaxLength(100)]
    public string? FirmEmail { get; set; }

    // Admin user details
    [Required(ErrorMessage = "First name is required")]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last name is required")]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// DTO for inviting a new user to the firm
/// </summary>
public class InviteUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
}

/// <summary>
/// DTO returned on successful authentication
/// </summary>
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserInfoDto User { get; set; } = null!;
}

/// <summary>
/// User info included in auth responses
/// </summary>
public class UserInfoDto
{
    public Guid Id { get; set; }
    public Guid FirmId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string FullName => $"{FirstName} {LastName}";
}

/// <summary>
/// DTO for changing password
/// </summary>
public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}
