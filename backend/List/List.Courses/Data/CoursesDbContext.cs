
using Microsoft.EntityFrameworkCore;
using List.Courses.Models;

namespace List.Courses.Data;

public class CoursesDbContext(DbContextOptions<CoursesDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories { get; set; }
    public DbSet<Period> Periods { get; set; }
    public DbSet<Course> Courses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>()
            .HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Course>()
                .HasOne(c => c.Period)
                .WithMany(p => p.Courses)
                .HasForeignKey(c => c.PeriodId)
                .OnDelete(DeleteBehavior.SetNull);
    }

}