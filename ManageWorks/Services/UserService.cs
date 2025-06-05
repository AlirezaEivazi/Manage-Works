using ManageWorks.Data;
using ManageWorks.DTO;
using ManageWorks.Models;
using Microsoft.AspNetCore.Identity;

namespace ManageWorks.Services
{
    public class UserService
    {
        private readonly PasswordHasher<User> _hasher = new PasswordHasher<User>();

        public bool Register(RegisterDto dto)
        {
            
            if (InMemoryDatabase.Users.Any(u => u.Username == dto.Username))
                return false;

            var user = new User
            {
                Username = dto.Username,
                Role = "User" 
            };

            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            InMemoryDatabase.Users.Add(user);
            return true;
        }
        public User LoginUser(LoginDto dto)
        {
            var user = InMemoryDatabase.Users.SingleOrDefault(u => u.Username == dto.Username);
            if (user == null)
                return null;

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            return result == PasswordVerificationResult.Success ? user : null;
        }


    }
}
