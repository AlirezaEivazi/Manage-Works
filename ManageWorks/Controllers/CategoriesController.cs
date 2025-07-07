using ManageWorks.DTO;
using ManageWorks.Models;
using ManageWorks.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

            var category = new Category { Name = dto.Name };
            InMemoryDatabase.Categories.Add(category);
            return Ok(category);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Edit(Guid id , CategoryDto dto)
        {
            var category = InMemoryDatabase.Categories.FirstOrDefault(c => c.Id == id);
            if (category == null) return NotFound();
            category.Name = dto.Name;
            return Ok(category);
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Delete(Guid id)
        {
            var category = InMemoryDatabase.Categories.FirstOrDefault(c => c.Id == id);
            if (category == null) return NotFound();

            InMemoryDatabase.Categories.Remove(category);
            return Ok();
        }
    }
}
