SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

-- ============================================================
-- STEP 1: Insert the SuperAdmin user (no valid password yet).
--         PasswordHash is set to a placeholder - MUST call
--         POST /api/auth/dev-reset-password after running this
--         to generate a proper ASP.NET Identity hash.
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM [legal].[Users] WHERE Email = 'vselever@yahoo.com')
BEGIN
    INSERT INTO [legal].[Users] (
        Id, UserName, NormalizedUserName, Email, NormalizedEmail,
        EmailConfirmed, PhoneNumberConfirmed, TwoFactorEnabled,
        LockoutEnabled, AccessFailedCount, PasswordHash,
        SecurityStamp, ConcurrencyStamp,
        FirstName, LastName, FirmId, Role, IsActive, CreatedAt
    ) VALUES (
        NEWID(),
        'vselever@yahoo.com', 'VSELEVER@YAHOO.COM',
        'vselever@yahoo.com', 'VSELEVER@YAHOO.COM',
        1, 0, 0,
        0, 0,
        'PLACEHOLDER_CALL_DEV_RESET_PASSWORD',
        CAST(NEWID() AS NVARCHAR(MAX)),
        CAST(NEWID() AS NVARCHAR(MAX)),
        'Vasile', 'Selever',
        -- SuperAdmin uses the default test firm to satisfy the FK constraint
        '00000000-0000-0000-0000-000000000001',
        0, 1, GETUTCDATE()
    );
    PRINT 'SuperAdmin vselever@yahoo.com created.';
    PRINT '';
    PRINT '>>> ACTION REQUIRED: Set a real password by calling:';
    PRINT '>>> POST http://localhost:5000/api/auth/dev-reset-password';
    PRINT '>>> Body: {"email":"vselever@yahoo.com","newPassword":"YourPass1!"}' ;
END
ELSE
BEGIN
    -- Clear any lockout so the account is accessible
    UPDATE [legal].[Users]
    SET LockoutEnd = NULL, AccessFailedCount = 0
    WHERE Email = 'vselever@yahoo.com';
    PRINT 'User already exists - lockout cleared.';
END

SELECT Id, Email, FirstName, LastName, Role, IsActive
FROM [legal].[Users]
WHERE Email = 'vselever@yahoo.com';
