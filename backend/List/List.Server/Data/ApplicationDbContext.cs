using Microsoft.EntityFrameworkCore;

namespace List.Server.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
}