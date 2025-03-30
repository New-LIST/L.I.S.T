using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using List.Server.Data;
using List.Server.Data.Models;
using System.Threading.Tasks;
using BCrypt.Net;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace List.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);


            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already in use.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Fullname = request.Fullname,
                Email = request.Email,
                Password = hashedPassword,
                Role = request.Role ?? UserRole.Student
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered", user.Id });
        }

        public class RegisterRequest
        {
            [Required]
            public string Fullname { get; set; }

            [Required, EmailAddress]
            public string Email { get; set; }

            [Required, MinLength(6)]
            public string Password { get; set; }

            [JsonConverter(typeof(System.Text.Json.Serialization.JsonStringEnumConverter))]
            public UserRole? Role { get; set; }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                return Unauthorized(new { message = "Invalid email or password." });

            var expireHours = request.RememberMe ? 336 : 24; // 14 days if remember me was ticked
            var token = GenerateJwtToken(user, expireHours);
            return Ok(new
            {
                message = "Login successful",
                token,
                user
            });
        }

        private string GenerateJwtToken(User user, int expireHours)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));

            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.Fullname),
        new Claim(ClaimTypes.Role, user.Role.ToString())
    };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expireHours),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }




        public class LoginRequest
        {
            [Required, EmailAddress]
            public string Email { get; set; }

            [Required]
            public string Password { get; set; }

            public bool RememberMe { get; set; } = false;
        }


    }
}
