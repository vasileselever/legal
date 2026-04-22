SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

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
        'AQAAAAIAAYagAAAAEA==',
        CAST(NEWID() AS NVARCHAR(MAX)),
        CAST(NEWID() AS NVARCHAR(MAX)),
        'Vasile', 'Selever',
        -- SuperAdmin uses the default test firm to satisfy the FK constraint
        '00000000-0000-0000-0000-000000000001',
        0, 1, GETUTCDATE()
    );
    PRINT 'SuperAdmin vselever@yahoo.com created.';
END
ELSE
    PRINT 'User already exists.';

SELECT Id, Email, FirstName, LastName, Role, IsActive
FROM [legal].[Users]
WHERE Email = 'vselever@yahoo.com';
