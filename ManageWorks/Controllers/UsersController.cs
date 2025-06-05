using ManageWorks.Data;
using ManageWorks.Models;
using ManageWorks.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace ManageWorks.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly PasswordHasher<User> _hasher = new PasswordHasher<User>();

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            return Ok(InMemoryDatabase.Users);
        }

        [HttpPost("users")]
        public IActionResult CreateUser(RegisterDto dto)
        {
            if (InMemoryDatabase.Users.Any(u => u.Username == dto.Username))
                return BadRequest("Username already exists");

            var user = new User
            {
                Username = dto.Username,
                Role = "User",
            };

            user.PasswordHash = _hasher.HashPassword(user, dto.Password);
            InMemoryDatabase.Users.Add(user);

            return Ok(user);
        }

        [HttpPut("users/{username}")]
        public IActionResult EditUser(string username, RegisterDto dto)
        {
            var user = InMemoryDatabase.Users.FirstOrDefault(u => u.Username == username);
            if (user == null) return NotFound();

            user.Username = dto.Username;
            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            return Ok(user);
        }

        [HttpDelete("users/{username}")]
        public IActionResult DeleteUser(string username)
        {
            var user = InMemoryDatabase.Users.FirstOrDefault(u => u.Username == username);
            if (user == null) return NotFound();

            InMemoryDatabase.Users.Remove(user);
            return Ok();
        }
    }
}
