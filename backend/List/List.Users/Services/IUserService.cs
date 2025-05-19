using List.Common.Models;
using List.Users.Models;

namespace List.Users.Services;

public interface IUserService
{
    public Task<IEnumerable<User>> GetUsersAsync();
    public Task<IEnumerable<User>> GetTeachersAsync();
    public Task<PagedResult<User>> GetUsersByAsync(UserRole? userRole, int page, int pageSize, string search);
    public Task<User?> GetUserAsync(int userId);
    public Task<bool> AddOrUpdateUserAsync(User user);
    public Task<bool> DeleteUserAsync(int userId);
    public Task<bool> IsUserExistsAsync(User user);
}