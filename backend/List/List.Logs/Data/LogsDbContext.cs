using Microsoft.EntityFrameworkCore;
using List.Logs.Models;

namespace List.Logs.Data;

public class LogsDbContext : DbContext
{
    public LogsDbContext(DbContextOptions<LogsDbContext> options) : base(options) { }

    public DbSet<ActivityLog> ActivityLogs { get; set; }
}
