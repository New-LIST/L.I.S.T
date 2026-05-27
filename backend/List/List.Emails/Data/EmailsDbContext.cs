using List.Emails.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Emails.Data;

public class EmailsDbContext(DbContextOptions<EmailsDbContext> options) : DbContext(options)
{
    public DbSet<Email> Emails { get; set; }
    public DbSet<EmailTemplate> EmailTemplates { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}