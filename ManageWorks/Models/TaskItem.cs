namespace ManageWorks.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? Text { get; set; }
        public bool IsDone { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string ? OwnerUsername { get; set; }  
    }
}
