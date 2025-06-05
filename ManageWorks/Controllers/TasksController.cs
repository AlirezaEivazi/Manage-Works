using ManageWorks.DTO;
using ManageWorks.Models;
using ManageWorks.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
            var tasks = InMemoryDatabase.Tasks.Where(t => t.OwnerUsername == username).ToList();
            return Ok(tasks);
        }

        [HttpPost]
        public IActionResult AddTask(TaskDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var task = new TaskItem
            {
                Text = dto.Text,
                IsDone = dto.IsDone,
                OwnerUsername = username
            };
            InMemoryDatabase.Tasks.Add(task);
            return Ok(task);
        }

        [HttpPut("{id}")]
        public IActionResult EditTask(Guid id, TaskDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var task = InMemoryDatabase.Tasks.FirstOrDefault(t => t.Id == id && t.OwnerUsername == username);
            if (task == null) return NotFound();

            task.Text = dto.Text;
            task.IsDone = dto.IsDone;
            task.CreatedAt = DateTime.Now;

            return Ok(task);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteTask(Guid id)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var task = InMemoryDatabase.Tasks.FirstOrDefault(t => t.Id == id && t.OwnerUsername == username);
            if (task == null) return NotFound();

            InMemoryDatabase.Tasks.Remove(task);
            return Ok();
        }
    }
}
