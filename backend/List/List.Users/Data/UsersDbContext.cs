
using Microsoft.EntityFrameworkCore;
using List.Users.Models;

namespace List.Users.Data;

public class UsersDbContext(DbContextOptions<UsersDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<AssistantCoursePermission> AssistantCoursePermissions { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<AssistantCoursePermission>()
            .HasIndex(p => new { p.AssistantUserId, p.CourseId })
            .IsUnique();
    }
}
