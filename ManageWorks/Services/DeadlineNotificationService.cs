using ManageWorks.Data;

namespace ManageWorks.Services
{
    public class DeadlineNotificationService : BackgroundService
    {
        private readonly NotificationService _notificationService;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

        public DeadlineNotificationService(
            NotificationService notificationService,
            IServiceScopeFactory scopeFactory)
        {
            _notificationService = notificationService;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var tasks = InMemoryDatabase.Tasks
                        .Where(t => !t.IsDone &&
                                   t.DeadLine.HasValue &&
                                   t.DeadLine.Value <= DateTime.UtcNow.AddHours(24) &&
                                   t.DeadLine.Value >= DateTime.UtcNow)
                        .ToList();

                    foreach (var task in tasks)
                    {
                        var user = InMemoryDatabase.Users
                            .FirstOrDefault(u => u.Username == task.OwnerUsername);

                        if (user != null && !string.IsNullOrEmpty(user.NotificationUrl))
                        {
                            await _notificationService.SendTaskNotification(
                                user.NotificationUrl, task);
                        }
                    }
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }
    }
}
