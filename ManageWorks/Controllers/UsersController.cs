using ManageWorks.Data;
using ManageWorks.Models;
using ManageWorks.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

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
            var usersWithTasks = InMemoryDatabase.Users.Select(user => new
            {
                user.Username,
                user.Role,
                Tasks = InMemoryDatabase.Tasks
                    .Where(t => t.OwnerUsername == user.Username)
                    .Select(t => new
                    {
                        t.Id,
                        t.Text,
                        t.IsDone,
                        // Only include valid categories
                        Category = InMemoryDatabase.Categories.Any(c => c.Name == t.Category) ? t.Category : null,
                        t.DeadLine
                    })
            }).ToList();

            return Ok(usersWithTasks);
        }

        [HttpPost("users")]
        public IActionResult CreateUser(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username))
                return BadRequest("Username is required");

            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Password is required");

            if (InMemoryDatabase.Users.Any(u =>
                string.Equals(u.Username, dto.Username, StringComparison.OrdinalIgnoreCase)))
                return BadRequest("Username already exists");

            var role = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role;

            if (!new[] { "Admin", "User" }.Contains(role))
                return BadRequest("Invalid role specified");

            var user = new User
            {
                Username = dto.Username,
                Role = role,
                NotificationUrl = null
            };

            user.PasswordHash = _hasher.HashPassword(user, dto.Password);
            InMemoryDatabase.Users.Add(user);

            return Ok(new
            {
                user.Username,
                user.Role,
                CreatedAt = DateTime.UtcNow
            });
        }

        [HttpPut("users/{username}")]
        public IActionResult EditUser(string username, RegisterDto dto)
        {
            var user = InMemoryDatabase.Users.FirstOrDefault(u =>
                string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));

            if (user == null)
                return NotFound("User not found");

            // Check for username conflict
            if (!string.Equals(user.Username, dto.Username, StringComparison.OrdinalIgnoreCase) &&
                InMemoryDatabase.Users.Any(u =>
                    string.Equals(u.Username, dto.Username, StringComparison.OrdinalIgnoreCase)))
                return BadRequest("Username already exists");

            // Update username if changed
            if (!string.Equals(user.Username, dto.Username, StringComparison.OrdinalIgnoreCase))
            {
                // Update tasks with new username
                var userTasks = InMemoryDatabase.Tasks
                    .Where(t => string.Equals(t.OwnerUsername, username, StringComparison.OrdinalIgnoreCase));

                foreach (var task in userTasks)
                {
                    task.OwnerUsername = dto.Username;
                }

                user.Username = dto.Username;
            }

            // Update password if provided
            if (!string.IsNullOrWhiteSpace(dto.Password))
                user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            // Update role if provided and valid
            if (!string.IsNullOrWhiteSpace(dto.Role))
            {
                if (!new[] { "Admin", "User" }.Contains(dto.Role))
                    return BadRequest("Invalid role specified");

                // Prevent removing last admin
                if (user.Role == "Admin" && dto.Role != "Admin" &&
                    InMemoryDatabase.Users.Count(u => u.Role == "Admin") <= 1)
                    return BadRequest("Cannot remove the last admin user");

                user.Role = dto.Role;
            }

            return Ok(new
            {
                user.Username,
                user.Role,
                UpdatedAt = DateTime.UtcNow
            });
        }

        [HttpDelete("users/{username}")]
        public IActionResult DeleteUser(string username)
        {
            var user = InMemoryDatabase.Users.FirstOrDefault(u =>
                string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));

            if (user == null)
                return NotFound("User not found");

            // Prevent deleting last admin
            if (user.Role == "Admin" &&
                InMemoryDatabase.Users.Count(u => u.Role == "Admin") <= 1)
                return BadRequest("Cannot delete the last admin user");

            // Delete user's tasks
            var userTasks = InMemoryDatabase.Tasks
                .Where(t => string.Equals(t.OwnerUsername, username, StringComparison.OrdinalIgnoreCase))
                .ToList();

            foreach (var task in userTasks)
            {
                InMemoryDatabase.Tasks.Remove(task);
            }

            InMemoryDatabase.Users.Remove(user);

            return Ok(new
            {
                DeletedUsername = username,
                DeletedTasksCount = userTasks.Count,
                DeletedAt = DateTime.UtcNow
            });
        }

        // New endpoint to clean up orphaned categories across all tasks
        [HttpPost("cleanup-categories")]
        public IActionResult CleanupCategories()
        {
            int cleanedCount = 0;

            foreach (var task in InMemoryDatabase.Tasks)
            {
                if (!string.IsNullOrEmpty(task.Category) &&
                    !InMemoryDatabase.Categories.Any(c => c.Name == task.Category))
                {
                    task.Category = null;
                    cleanedCount++;
                }
            }

            return Ok(new
            {
                CleanedTasksCount = cleanedCount,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}