using List.Courses.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace List.TaskSets.Models;


public class CourseTaskSetRel
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

    [ForeignKey("CourseId")]
    public Course? Course { get; set; }


    [ForeignKey("TaskSetTypeId")]   
    public TaskSetType TaskSetType { get; set; } = null!;

    
    
}
