using List.DataMigration.DTOs;
using Microsoft.EntityFrameworkCore;

namespace List.DataMigration.Data;

public class OldListDbContext(DbContextOptions<OldListDbContext> options) : DbContext(options)
{
    public DbSet<CategoryDto> Categories { get; set; }
    public DbSet<CoursesDto> Courses { get; set; }
    public DbSet<PeriodDto> Periods { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
