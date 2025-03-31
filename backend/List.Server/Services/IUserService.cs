using List.Server.Data.Models;

namespace List.Server.Services;

public interface IUserService
{
    public Task<IEnumerable<User>> GetUsersAsync();
    public Task<User?> GetUserAsync(int userId);
    public Task<bool> AddOrUpdateUserAsync(User user);
    public Task<bool> DeleteUserAsync(int userId);
    public Task<bool> IsUserExistsAsync(User user);
}