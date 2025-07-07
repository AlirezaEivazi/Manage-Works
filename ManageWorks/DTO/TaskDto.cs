namespace ManageWorks.DTO
{
    public class TaskDto
    {
        public string? Text { get; set; }
        public bool IsDone { get; set; }
        public string Category { get; set; }
        public DateTime? DeadLine { get; set; }
    }
}