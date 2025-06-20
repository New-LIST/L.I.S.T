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

    public DbSet<CategoryModel> Categories { get; set; }


    public DbSet<TaskCategoryRel> TaskCategoryRels { get; set; }

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

            entity.HasOne(t => t.ParentTask)
                  .WithMany(t => t.Variants)
                  .HasForeignKey(t => t.ParentTaskId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CategoryModel>()
            .HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskCategoryRel>()
            .HasKey(tc => new { tc.TaskId, tc.CategoryId });

        modelBuilder.Entity<TaskCategoryRel>()
            .HasOne(tc => tc.Task)
            .WithMany(t => t.TaskCategories)
            .HasForeignKey(tc => tc.TaskId);

        modelBuilder.Entity<TaskCategoryRel>()
            .HasOne(tc => tc.Category)
            .WithMany(c => c.TaskCategories)
            .HasForeignKey(tc => tc.CategoryId);
    }
}