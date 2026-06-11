using System.Runtime.CompilerServices;
using System.Threading.Channels;
using List.Emails.Data;
using Microsoft.EntityFrameworkCore;

namespace List.Emails.Models;

public class EmailQueue
{
    private const int MaxQueueSize = 100_000;
    
    private readonly Channel<Email> _highPriorityQueue = Channel.CreateBounded<Email>(
        new BoundedChannelOptions(MaxQueueSize)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });
    private readonly Channel<Email> _normalPriorityQueue = Channel.CreateBounded<Email>(
        new BoundedChannelOptions(MaxQueueSize)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });
    private readonly Channel<Email> _lowPriorityQueue = Channel.CreateBounded<Email>(
        new BoundedChannelOptions(MaxQueueSize)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });

    public async Task Init(EmailsDbContext dbContext)
    {
        foreach (var email in dbContext.Emails.Where(x => x.Sent == false))
            await EnqueueEmailAsync(email);
    }

    private bool EnqueueEmail(Email email) =>
        email.Priority switch
        {
            EmailPriority.High => _highPriorityQueue.Writer.TryWrite(email),
            EmailPriority.Normal => _normalPriorityQueue.Writer.TryWrite(email),
            EmailPriority.Low => _lowPriorityQueue.Writer.TryWrite(email),
            _ => false
        };
    
    public async Task<bool> EnqueueEmailAsync(Email email)
    {
        await _highPriorityQueue.Writer.WaitToWriteAsync();
        return EnqueueEmail(email);
    }
    
    public async IAsyncEnumerable<Email> ReadAllAsync([EnumeratorCancellation] CancellationToken stoppingToken)
    {
        while (true)
        {
            await Task.WhenAny(_highPriorityQueue.Reader.WaitToReadAsync(stoppingToken).AsTask(),
                _normalPriorityQueue.Reader.WaitToReadAsync(stoppingToken).AsTask(),
                _lowPriorityQueue.Reader.WaitToReadAsync(stoppingToken).AsTask());

            if (_highPriorityQueue.Reader.TryPeek(out _))
                await foreach (var email in _highPriorityQueue.Reader.ReadAllAsync(stoppingToken))
                {
                    yield return email;
                }
            if (_normalPriorityQueue.Reader.TryPeek(out _))
                await foreach (var email in _normalPriorityQueue.Reader.ReadAllAsync(stoppingToken))
                {
                    yield return email;
                }
            await foreach (var email in _lowPriorityQueue.Reader.ReadAllAsync(stoppingToken))
            {
                yield return email;
            }
        }
    }
}