using Microsoft.EntityFrameworkCore;
using List.Assignments.Models;
using List.Tasks.Models;
using List.Courses.Models;
using List.TaskSets.Models;
using List.Users.Models;

namespace List.Assignments.Data;

public class AssignmentsDbContext(DbContextOptions<AssignmentsDbContext> options) : DbContext(options)
{
    public DbSet<AssignmentModel> Assignments { get; set; }
    public DbSet<AssignmentTaskRelModel> AssignmentTaskRels { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TaskModel>(entity =>
        {
            entity.ToTable("tasks", t => t.ExcludeFromMigrations());
        });

        modelBuilder.Entity<TaskSetType>(entity =>
        {
            entity.ToTable("task_set_types", t => t.ExcludeFromMigrations());
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.ToTable("Courses", t => t.ExcludeFromMigrations());
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users", t => t.ExcludeFromMigrations());
        });

        modelBuilder.Entity<Period>(entity =>
        {
            entity.ToTable("Periods", t => t.ExcludeFromMigrations());
        });

        modelBuilder.Entity<CourseTaskSetRel>(entity =>
        {
            entity.ToTable("course_task_set_rel", t => t.ExcludeFromMigrations());
        });

        // Relacia Assignment ↔ AssignmentTaskRel
        modelBuilder.Entity<AssignmentTaskRelModel>()
            .HasOne(r => r.Assignment)
            .WithMany()
            .HasForeignKey(r => r.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relacia Task ↔ AssignmentTaskRel
        modelBuilder.Entity<AssignmentTaskRelModel>()
            .HasOne(r => r.Task)
            .WithMany()
            .HasForeignKey(r => r.TaskId)
            .OnDelete(DeleteBehavior.Restrict);

        // Composite Key (TaskId + AssignmentId)
        modelBuilder.Entity<AssignmentTaskRelModel>()
            .HasKey(r => new { r.TaskId, r.AssignmentId });

        // Relacia Assignment ↔ TaskSetType
        modelBuilder.Entity<AssignmentModel>()
            .HasOne(a => a.TaskSetType)
            .WithMany()
            .HasForeignKey(a => a.TaskSetTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relacia Assignment ↔ Course
        modelBuilder.Entity<AssignmentModel>()
            .HasOne(a => a.Course)
            .WithMany()
            .HasForeignKey(a => a.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AssignmentModel>()
            .HasOne(a => a.CourseTaskSetRel)
            .WithMany() // ak nechceš navigáciu naspäť
            .HasForeignKey(a => new { a.CourseId, a.TaskSetTypeId })
            .HasPrincipalKey(c => new { c.CourseId, c.TaskSetTypeId })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
