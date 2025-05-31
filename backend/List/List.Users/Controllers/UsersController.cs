using System.Text;
using List.Common.Models;
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
    [HttpGet("teachers")]
    public async Task<IEnumerable<User>> GetTeachersAsync()
    {
        return await userService.GetTeachersAsync();
    }

    [HttpGet]
    public async Task<PagedResult<User>> GetUserPageAsync(int page = 0, int pageSize = 100, string search = "")
    {
        return await userService.GetUsersByAsync(null, page, pageSize, search);
    }

    [HttpPost]
    public async Task<IActionResult> AddUserAsync(UserDto userDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = UserMapFromDto(userDto);

        var userExists = await userService.IsUserExistsAsync(user);
        if (userExists)
            return BadRequest("Používateľ už existuje.");

        var success = await userService.AddOrUpdateUserAsync(user);
        if (!success)
            return BadRequest("Nepodarilo sa vytvoriť používateľa.");

        return Ok(user);
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUserAsync(int id, [FromBody] UserUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingUser = await userService.GetUserAsync(id);
        if (existingUser == null)
            return NotFound();

        existingUser.Fullname = dto.FullName;
        existingUser.Email = dto.Email;
        existingUser.Role = dto.Role;

        var updated = await userService.UpdateUserAsync(existingUser);
        if (updated)
            return Ok();

        return BadRequest("Nepodarilo sa upraviť používateľa.");
    }



    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUserAsync(int id)
    {
        if (await userService.DeleteUserAsync(id))
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

        return Ok($"Created {addedUsers.Count} new users");
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