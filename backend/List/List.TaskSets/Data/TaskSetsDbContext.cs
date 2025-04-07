using List.TaskSets.Models;
using Microsoft.EntityFrameworkCore;
using List.Courses.Models;
namespace List.TaskSets.Data;

public class TaskSetsDbContext(DbContextOptions<TaskSetsDbContext> options) : DbContext(options)
{

    public DbSet<CourseTaskSetRel> CourseTaskSetRels => Set<CourseTaskSetRel>();
    public DbSet<TaskSetType> TaskSetTypes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Course>().ToTable((string?)null);
        modelBuilder.Ignore<Period>();
        
    
        modelBuilder.Entity<TaskSetType>(entity =>
        {
            entity.ToTable("task_set_types");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Identifier)
                .HasColumnName("identifier")
                .HasMaxLength(255);

            entity.HasIndex(e => e.Name)
                .IsUnique();

            entity.HasIndex(e => e.Identifier)
                .IsUnique();
        });

        modelBuilder.Entity<CourseTaskSetRel>(entity =>
        {
            entity.ToTable("course_task_set_rel");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.CourseId).HasColumnName("course_id").IsRequired();
            entity.Property(e => e.TaskSetTypeId).HasColumnName("task_set_type_id").IsRequired();

            entity.Property(e => e.UploadSolution).HasColumnName("upload_solution").IsRequired();
            entity.Property(e => e.MinPoints).HasColumnName("min_points");
            entity.Property(e => e.MinPointsInPercentage).HasColumnName("min_points_in_percentage").IsRequired();
            entity.Property(e => e.IncludeInTotal).HasColumnName("include_in_total").IsRequired();
            entity.Property(e => e.Virtual).HasColumnName("virtual").IsRequired();

            entity.Property(e => e.Formula).HasColumnName("formula");
            entity.Property(e => e.FormulaObject).HasColumnName("formula_object");

            entity.HasOne(e => e.Course)
                .WithMany()
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TaskSetType)
                .WithMany()
                .HasForeignKey(e => e.TaskSetTypeId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
