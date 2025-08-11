using List.Tests.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Tests.Data;

public class TestsDbContext(DbContextOptions<TestsDbContext> options) : DbContext
{
    public DbSet<Test> Tests { get; set; }
}