namespace List.TaskSets.Dtos;

public class CourseTaskSetRelDto
{
    public int Id { get; set; }

    public int CourseId { get; set; }
    public int TaskSetTypeId { get; set; }

    public bool UploadSolution { get; set; }
    public double? MinPoints { get; set; }
    public bool MinPointsInPercentage { get; set; }
    public bool IncludeInTotal { get; set; }
    public bool Virtual { get; set; }

    public string? Formula { get; set; }
    public string? FormulaObject { get; set; }
}
