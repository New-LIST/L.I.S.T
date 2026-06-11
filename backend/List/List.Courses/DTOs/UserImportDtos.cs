namespace List.Courses.DTOs;

public class UserImportPreviewDto
{
    public string Delimiter { get; set; } = "semicolon";
    public bool HasHeader { get; set; }
    public List<string> Headers { get; set; } = new();
    public List<UserImportPreviewRowDto> Rows { get; set; } = new();
    public List<UserImportPreviewErrorDto> Errors { get; set; } = new();
    public bool Truncated { get; set; }
}

public class UserImportPreviewRowDto
{
    public int RowNumber { get; set; }
    public List<string> Values { get; set; } = new();
}

public class UserImportPreviewErrorDto
{
    public int RowNumber { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ExecuteUserImportDto
{
    public List<UserImportRowDto> Rows { get; set; } = new();
    public int? CourseId { get; set; }
    public int? GroupId { get; set; }
    public bool Allowed { get; set; } = true;
}

public class UserImportRowDto
{
    public int RowNumber { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class UserImportResultDto
{
    public int CreatedUsers { get; set; }
    public int ExistingUsers { get; set; }
    public int AddedParticipants { get; set; }
    public int ExistingParticipants { get; set; }
    public int FailedRows { get; set; }
    public List<UserImportRowResultDto> Rows { get; set; } = new();
}

public class UserImportRowResultDto
{
    public int RowNumber { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
