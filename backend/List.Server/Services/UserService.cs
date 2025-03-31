using List.Server.Data;
using List.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Server.Services;

public class UserService(ApplicationDbContext context) : IUserService
{
    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await context.Users.ToListAsync();
    }

    public async Task<User?> GetUserAsync(int userId)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<bool> AddOrUpdateUserAsync(User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var user = context.Users.FirstOrDefault(u => u.Id == userId);
        if (user is null)
            return false;

        context.Users.Remove(user);
        await context.SaveChangesAsync();
        
        return true;
    }

    public Task<bool> IsUserExistsAsync(User user)
    {
        return context.Users.AnyAsync(u => u.Id == user.Id || u.Email == user.Email);
    }
}