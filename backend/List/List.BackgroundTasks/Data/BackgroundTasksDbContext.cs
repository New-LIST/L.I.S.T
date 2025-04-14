
using List.BackgroundTasks.Models;
using Microsoft.EntityFrameworkCore;

namespace List.BackgroundTasks.Data;

public class BackgroundTasksDbContext(DbContextOptions<BackgroundTasksDbContext> options) : DbContext(options)
{
    public DbSet<Email> Emails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        
    }
}