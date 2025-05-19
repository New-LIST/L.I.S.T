using Microsoft.EntityFrameworkCore;

namespace List.Tests.Data;

public class TestsDbContext(DbContextOptions<TestsDbContext> options) : DbContext
{
    
}