
using Microsoft.EntityFrameworkCore;
using List.Courses.Models;
using List.Users.Models;

namespace List.Courses.Data;

public class CoursesDbContext(DbContextOptions<CoursesDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories { get; set; }
    public DbSet<Period> Periods { get; set; }
    public DbSet<Course> Courses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.ToTable("Users", t => t.ExcludeFromMigrations());
        });

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

        modelBuilder.Entity<Course>()
            .HasOne(c => c.Teacher)
            .WithMany()
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

    }

}