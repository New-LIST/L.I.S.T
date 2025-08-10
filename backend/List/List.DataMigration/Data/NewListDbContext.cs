using List.Assignments.Models;
using List.Courses.Models;
using List.DataMigration.DTOs;
using Microsoft.EntityFrameworkCore;

namespace List.DataMigration.Data;

public class NewListDbContext(DbContextOptions<NewListDbContext> options) : DbContext(options)
{
    public DbSet<AssignmentModel> Assignments { get; set; }
    public DbSet<AssignmentTaskRelModel> AssignmentTaskRels { get; set; }
    public DbSet<SolutionModel> Solutions { get; set; }
    public DbSet<SolutionVersionModel> SolutionVersions { get; set; }
    
    public DbSet<Period> Periods { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Participant> Participants { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
