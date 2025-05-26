using List.Users.Data;
using List.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace List.Users.Services;

public class AssistantPermissionService : IAssistantPermissionService
{
    private readonly UsersDbContext _context;

    public AssistantPermissionService(UsersDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HasPermissionAsync(int userId, Func<AssistantPermissions, bool> permissionSelector)
    {
        var permissions = await _context.AssistantPermissions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        return permissions != null && permissionSelector(permissions);
    }
}
