using LegalRO.CaseManagement.Application.Services;
using LegalRO.CaseManagement.Domain.Entities;
using LegalRO.CaseManagement.Infrastructure.Data;
using LegalRO.CaseManagement.Infrastructure.Services;
using LegalRO.CaseManagement.Infrastructure.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/legalro-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

Log.Information("Configuring LegalRO Case Management API...");

try
{
    // Add services to the container
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

    // Persist DataProtection keys to a stable directory backed by a Docker volume.
    // Keys are encrypted at rest using a self-signed X.509 certificate baked into the image.
    var keysDir = new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "keys"));
    keysDir.Create();
    var dpBuilder = builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(keysDir)
        .SetApplicationName("LegalRO.CaseManagement");

    var pfxPath = Path.Combine(builder.Environment.ContentRootPath, "dataprotection.pfx");
    if (File.Exists(pfxPath))
    {
        var cert = new System.Security.Cryptography.X509Certificates.X509Certificate2(
            pfxPath, "dp-internal",
            System.Security.Cryptography.X509Certificates.X509KeyStorageFlags.EphemeralKeySet);
        dpBuilder.ProtectKeysWithCertificate(cert);
    }

    // Configure SQL Server with Entity Framework Core
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

    // Configure Identity
    builder.Services.AddIdentityCore<User>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;

        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;

        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

    // Configure JWT Authentication
    var jwtKey = builder.Configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("JWT Key not configured");
    var jwtIssuer = builder.Configuration["Jwt:Issuer"];
    var jwtAudience = builder.Configuration["Jwt:Audience"];

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

    // Add Authorization
    builder.Services.AddAuthorization();

    // Register AI Legal Research service
    builder.Services.AddScoped<ILegalResearchService, LegalResearchService>();

    // Register Document Automation service
    builder.Services.AddScoped<IDocumentAutomationService, DocumentAutomationService>();

    // Register Billing & Financial Management service
    builder.Services.AddScoped<IBillingService, BillingService>();

    // Register Notification services (Email/SMS)
    builder.Services.Configure<NotificationSettings>(
        builder.Configuration.GetSection("Notifications"));
    builder.Services.AddScoped<EmailNotificationService>();
    builder.Services.AddScoped<SmsNotificationService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();

    // Add Controllers
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        });

    // Add CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? new[]
                {
                    "http://localhost:5173",   // Vite dev server
                    "https://localhost:5173",  // Vite dev server (HTTPS)
                    "http://localhost:3000",   // legacy / CRA
                };

            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

    // Add API Documentation (Swagger)
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "LegalRO Case Management API",
            Version = "v1",
            Description = "API for Romanian Law Firm Case Management System",
            Contact = new OpenApiContact
            {
                Name = "LegalRO Support",
                Email = "support@legalro.ro"
            }
        });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    // Add Health Checks
    builder.Services.AddHealthChecks()
        .AddSqlServer(connectionString, tags: new[] { "db", "sql" });

    var app = builder.Build();

    // Configure the HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "LegalRO API V1");
            c.RoutePrefix = "swagger";
        });
    }

    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }

    app.UseCors("AllowFrontend");

    app.UseStaticFiles();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.MapHealthChecks("/health");

    // DEV ONLY: email smoke test — remove before production
    if (app.Environment.IsDevelopment())
    {
        app.MapPost("/dev/test-email", async (INotificationService notifications, IOptions<NotificationSettings> options, CancellationToken ct) =>
        {
            await notifications.SendLeadConfirmationEmailAsync(
                toEmail: "test@legalro.local",
                toName: "Test User",
                practiceArea: "Drept Civil",
                ct: ct);

            var s = options.Value;
            return Results.Ok(new
            {
                message = "Email sent — check http://localhost:8025",
                smtpEnabled = s.Smtp?.IsEnabled,
                smtpHost = s.Smtp?.Host,
                smtpPort = s.Smtp?.Port
            });
        }).ExcludeFromDescription();
    }

    if (!app.Environment.IsDevelopment())   
    {
        app.MapFallbackToFile("index.html");
    }

    // Apply database migrations on startup
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            var userManager = services.GetRequiredService<UserManager<User>>();

            await context.Database.MigrateAsync();
            Log.Information("Database migration completed successfully");

            var shouldSeed = app.Environment.IsDevelopment()
                || builder.Configuration.GetValue<bool>("SeedDatabase");

            if (shouldSeed)
            {
                await DatabaseSeeder.SeedAsync(context, userManager);
                Log.Information("Database seeding completed successfully");
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "An error occurred while migrating/seeding the database");
        }
    }

    Log.Information("Starting LegalRO Case Management API");
    Log.Information("Environment: {Environment}", app.Environment.EnvironmentName);

    await app.RunAsync();

    Log.Information("LegalRO Case Management API shut down gracefully");
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
    throw;
}
finally
{
    await Log.CloseAndFlushAsync();
}

public partial class Program { }

















































