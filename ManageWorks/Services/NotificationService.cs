using ManageWorks.Models;
using System.Text.Json;

namespace ManageWorks.Services
{
    public class NotificationService
    {
        private readonly HttpClient _httpClient;
        public static List<string> NotificationLogs { get; } = new();

        public NotificationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task SendTaskNotification(string url, TaskItem task)
        {
            try
            {
                var payload = new
                {
                    TaskId = task.Id,
                    TaskText = task.Text,
                    Deadline = task.DeadLine,
                    IsDone = task.IsDone,
                    Category = task.Category
                };

                var logEntry = $"[{DateTime.UtcNow}] Sent to {url}: {JsonSerializer.Serialize(payload)}";
                NotificationLogs.Add(logEntry);
                Console.WriteLine(logEntry); // Also log to console

                var response = await _httpClient.PostAsJsonAsync(url, payload);

                if (!response.IsSuccessStatusCode)
                {
                    var errorLog = $"[{DateTime.UtcNow}] Failed to send to {url}: Status {response.StatusCode}";
                    NotificationLogs.Add(errorLog);
                    Console.WriteLine(errorLog);
                }
            }
            catch (Exception ex)
            {
                var errorLog = $"[{DateTime.UtcNow}] Error sending to {url}: {ex.Message}";
                NotificationLogs.Add(errorLog);
                Console.WriteLine(errorLog);
            }
        }
    }
}