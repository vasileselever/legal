using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace LegalRO.CaseManagement.Infrastructure.Data;

/// <summary>
/// Sets QUOTED_IDENTIFIER ON and ANSI_NULLS ON for every SQL Server connection
/// so that EF writes on tables with filtered indexes / computed columns never fail
/// with error 1934.
/// </summary>
public class SqlServerSessionInterceptor : DbConnectionInterceptor
{
    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        SetSessionOptions(connection);
    }

    public override async Task ConnectionOpenedAsync(
        DbConnection connection, ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        SetSessionOptions(connection);
        await Task.CompletedTask;
    }

    private static void SetSessionOptions(DbConnection connection)
    {
        try
        {
            using var cmd = connection.CreateCommand();
            cmd.CommandText = "SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON;";
            cmd.ExecuteNonQuery();
        }
        catch
        {
            // Swallow — connection may already be in a state where SET is not needed
        }
    }
}
