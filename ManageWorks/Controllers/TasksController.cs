using ManageWorks.DTO;
using ManageWorks.Models;
using ManageWorks.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using ManageWorks.Services;

namespace ManageWorks.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetMyTasks()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var tasks = InMemoryDatabase.Tasks
                .Where(t => t.OwnerUsername == username)
                // Filter out null/empty categories in the response
                .Select(t => new TaskItem
                {
                    Id = t.Id,
                    Text = t.Text,
                    IsDone = t.IsDone,
                    OwnerUsername = t.OwnerUsername,
                    CreatedAt = t.CreatedAt,
                    // Only show category if it's not null/empty
                    Category = !string.IsNullOrEmpty(t.Category) ? t.Category : null,
                    DeadLine = t.DeadLine
                })
                .ToList();
            return Ok(tasks);
        }

        [HttpGet("notification-logs")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetNotificationLogs()
        {
            return Ok(NotificationService.NotificationLogs);
        }

        [HttpPut("set-notification-url")]
        public IActionResult SetNotificationUrl([FromBody] SetNotificationUrlDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var user = InMemoryDatabase.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
                return NotFound();

            user.NotificationUrl = dto.Url;
            return Ok();
        }

        [HttpGet("notification-url")]
        public IActionResult GetNotificationUrl()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var user = InMemoryDatabase.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
                return NotFound();

            return Ok(new { url = user.NotificationUrl });
        }

        [HttpPost]
        public IActionResult AddTask(TaskDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrWhiteSpace(dto.Text))
                return BadRequest("Task text is required");

            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Text = dto.Text,
                IsDone = dto.IsDone,
                OwnerUsername = username,
                Category = dto.Category,
                DeadLine = dto.DeadLine,
                CreatedAt = DateTime.UtcNow
            };

            InMemoryDatabase.Tasks.Add(task);
            return Ok(task);
        }

        [HttpPut("{id}")]
        public IActionResult EditTask(Guid id, TaskDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var task = InMemoryDatabase.Tasks.FirstOrDefault(t => t.Id == id && t.OwnerUsername == username);
            if (task == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(dto.Text))
                return BadRequest("Task text is required");

            task.Text = dto.Text;
            task.IsDone = dto.IsDone;
            task.Category = dto.Category;
            task.DeadLine = dto.DeadLine;

            return Ok(task);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteTask(Guid id)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var task = InMemoryDatabase.Tasks.FirstOrDefault(t => t.Id == id && t.OwnerUsername == username);
            if (task == null)
                return NotFound();

            InMemoryDatabase.Tasks.Remove(task);
            return Ok();
        }
    }
}