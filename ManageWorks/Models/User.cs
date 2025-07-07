namespace ManageWorks.Models
{
    public class User
    {
        public string? Username { get; set; }
        public string? PasswordHash { get; set; }
        public string? Role { get; set; }
        public string? NotificationUrl { get; set; }
        public List<TaskItem> Tasks { get; set; } = new();

    }
}