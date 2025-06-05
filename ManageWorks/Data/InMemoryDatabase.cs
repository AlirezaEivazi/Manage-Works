using ManageWorks.Models;
using System.Collections.Generic;


namespace ManageWorks.Data
{
    public static class InMemoryDatabase
    {
        public static List<TaskItem> Tasks { get; set; } = new();

        public static List<User> Users { get; } = new List<User>();

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
        }
    }
}

