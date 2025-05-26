using System;
using System.Threading.Tasks;
using List.Users.Models;

namespace List.Users.Services;

public interface IAssistantPermissionService
{
    Task<bool> HasPermissionAsync(int userId, Func<AssistantPermissions, bool> permissionSelector);
}
