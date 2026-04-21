-- Hotfix: add Documents.GeneratedDocumentId column and register the migration.
-- The original 20260421134404_AddGeneratedDocumentIdToDocument migration incorrectly
-- tried to re-add Lead fiscal columns that already exist. Run this once against the
-- target database (SSMS / sqlcmd) to align the schema without replaying the bad migration.

IF COL_LENGTH('legal.Documents', 'GeneratedDocumentId') IS NULL
BEGIN
    ALTER TABLE [legal].[Documents] ADD [GeneratedDocumentId] uniqueidentifier NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260421134404_AddGeneratedDocumentIdToDocument'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260421134404_AddGeneratedDocumentIdToDocument', N'8.0.0');
END;
GO
