using ManageWorks.Models;
using System.Collections.Generic;


namespace ManageWorks.Data
{
    public static class InMemoryDatabase
    {
        public static List<TaskItem> Tasks { get; set; } = new();

        public static List<User> Users { get; } = new List<User>();
        public static List<Category> Categories { get; } = new List<Category>();

        static InMemoryDatabase()
        {

            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            var adminUser = new User
            {
                Username = "admin",
                Role = "Admin"
            };
            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "admin");

            Users.Add(adminUser);

            Categories.AddRange(new List<Category>
            {
                new Category { Name = "Work" },
                new Category { Name = "Personal" },
                new Category { Name = "Shopping" }
            });
        }
    }
}