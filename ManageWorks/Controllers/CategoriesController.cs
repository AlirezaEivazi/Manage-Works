using ManageWorks.DTO;
using ManageWorks.Models;
using ManageWorks.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace ManageWorks.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(InMemoryDatabase.Categories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult Create(CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Category name is required");

            if (InMemoryDatabase.Categories.Any(c => c.Name == dto.Name))
                return BadRequest("Category already exists");

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = dto.Name
            };
            InMemoryDatabase.Categories.Add(category);
            return Ok(category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Edit(Guid id, CategoryDto dto)
        {
            var category = InMemoryDatabase.Categories.FirstOrDefault(c => c.Id == id);
            if (category == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Category name is required");

            if (InMemoryDatabase.Categories.Any(c => c.Name == dto.Name && c.Id != id))
                return BadRequest("Category already exists");

            // Update all tasks with the old category name
            var oldName = category.Name;
            var affectedTasks = InMemoryDatabase.Tasks
                .Where(t => t.Category == oldName)
                .ToList();

            foreach (var task in affectedTasks)
            {
                task.Category = dto.Name;
            }

            category.Name = dto.Name;
            return Ok(new
            {
                Category = category,
                UpdatedTasksCount = affectedTasks.Count
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Delete(Guid id)
        {
            var category = InMemoryDatabase.Categories.FirstOrDefault(c => c.Id == id);
            if (category == null)
                return NotFound();

            // First delete all tasks with this category
            var tasksToDelete = InMemoryDatabase.Tasks
                .Where(t => t.Category == category.Name)
                .ToList();

            foreach (var task in tasksToDelete)
            {
                InMemoryDatabase.Tasks.Remove(task);
            }

            // Then delete the category
            InMemoryDatabase.Categories.Remove(category);

            return Ok(new
            {
                DeletedCategory = category.Name,
                DeletedTasksCount = tasksToDelete.Count
            });
        }
    }
}