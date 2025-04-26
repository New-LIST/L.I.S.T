using Microsoft.EntityFrameworkCore;
using List.Tasks.Models;
using List.Users.Models;

namespace List.Tasks.Data;

public class TasksDbContext : DbContext
{
    public TasksDbContext(DbContextOptions<TasksDbContext> options) : base(options)
    {
    }

    public DbSet<TaskModel> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tell EF Core that the User entity is managed by another context
        modelBuilder.Entity<User>(entity => {
            entity.ToTable("Users");
            // This is crucial - it tells EF Core not to include this entity in migrations
            entity.HasKey(e => e.Id);
            // Skip creating Users table in migrations
            entity.ToTable("Users", t => t.ExcludeFromMigrations());
        });

        modelBuilder.Entity<TaskModel>(entity =>
        {
            entity.HasOne(t => t.Author)
                  .WithMany()
                  .HasForeignKey(t => t.AuthorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}