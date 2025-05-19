using List.Common.Models;
using List.Users.Data;
using List.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Users.Services;

public class UserService(UsersDbContext context) : IUserService
{
    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await context.Users.ToListAsync();
    }

    public async Task<PagedResult<User>> GetUsersByAsync(UserRole? userRole, int page, int pageSize, string search)
    {
        var searchString = search.ToLower();
        return new() { Items = await context.Users
            .Where(u => userRole == null || u.Role == userRole)
            .Where(user => string.IsNullOrWhiteSpace(searchString)
                           || user.Fullname.ToLower().Contains(searchString)
                           || user.Email.ToLower().Contains(searchString))
            .Skip((page) * pageSize)
            .Take(pageSize)
            .ToListAsync(),
            TotalCount = await context.Users.Where(u => userRole == null || u.Role == userRole)
            .Where(user => string.IsNullOrWhiteSpace(searchString)
                           || user.Fullname.ToLower().Contains(searchString)
                           || user.Email.ToLower().Contains(searchString))
            .CountAsync() 
        };
    }

    public async Task<User?> GetUserAsync(int userId)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<bool> AddOrUpdateUserAsync(User user)
    {
        try
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
        }
        catch
        {
            return false;
        }
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

    public async Task<IEnumerable<User>> GetTeachersAsync()
    {
        return await context.Users
        .Where(u => u.Role == 0)
        .ToListAsync();
    }
}