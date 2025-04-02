using System.Text;
using List.Users.DTOs;
using List.Users.Models;
using List.Users.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TinyCsvParser;
using TinyCsvParser.Mapping;

namespace List.Users.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await userService.GetUsersAsync();
    }

    [HttpPost]
    public async Task<IActionResult> AddUserAsync(UserDto userDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = UserMapFromDto(userDto);

        var userExists = await userService.IsUserExistsAsync(user);
        
        if (!userExists && await userService.AddOrUpdateUserAsync(user))
            return Created();
        
        return BadRequest();
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUserAsync(int userId)
    {
        if (await userService.DeleteUserAsync(userId))
            return Ok();
        
        return BadRequest();
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportUsersAsync(IFormFile file)
    {
        var fileExtension = Path.GetExtension(file.FileName);
        if (fileExtension != ".csv")
            return BadRequest();

        var csvParser = new CsvParser<CsvUserDto>(
            new CsvParserOptions(true, ';'),
            new CsvUserMapping());
        
        var users = csvParser
            .ReadFromStream(file.OpenReadStream(), Encoding.UTF8)
            .Select(res => res.Result)
            .Select(UserMapFromCsv)
            .ToList();
        
        var addedUsers = new List<User>();

        foreach (var user in users)
        {
            if (await userService.AddOrUpdateUserAsync(user))
                addedUsers.Add(user);
        }
        
        if (addedUsers.Count > 0)
            return Created();
        
        return BadRequest("Failed to import users");
    }

    private static User UserMapFromDto(UserDto userDto) => new()
    {
        Fullname = userDto.FullName,
        Email = userDto.Email,
        Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
        Role = userDto.Role
    };

    private static User UserMapFromCsv(CsvUserDto userCsv) => new()
    {
        Fullname = $"{userCsv.Name} {userCsv.LastName}",
        Email = userCsv.Email,
        Password = BCrypt.Net.BCrypt.HashPassword("temp"),
        Role = UserRole.Student
    };
}

internal class CsvUserMapping : CsvMapping<CsvUserDto>
{
    public CsvUserMapping() : base()
    {
        MapProperty(0, x => x.Name);
        MapProperty(1, x => x.LastName);
        MapProperty(20, x => x.Email);
    }
}

internal class CsvUserDto
{
    public string Name { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
}