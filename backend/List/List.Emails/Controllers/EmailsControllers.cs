using List.Emails.Models;
using List.Emails.Services;
using Microsoft.AspNetCore.Mvc;

namespace List.Emails.Controllers;

[ApiController]
[Route("api/emails")]
public class EmailsControllers(IEmailService emailService) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<Email>> GetAsync()
    {
        return await emailService.GetEmailsAsync();
    }
}