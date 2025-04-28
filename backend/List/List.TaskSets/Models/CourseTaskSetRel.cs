using List.Courses.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace List.TaskSets.Models;


public class CourseTaskSetRel
{
    [Key]
    public int Id { get; set; }

    [Column("course_id")]
    public int CourseId { get; set; }
    
    [Column("task_set_type_id")]
    public int TaskSetTypeId { get; set; }
    
    [Column("upload_solution")]
    public bool UploadSolution { get; set; }

    [Column("min_points")]
    public double? MinPoints { get; set; }

    [Column("min_points_in_percentage")]
    public bool MinPointsInPercentage { get; set; }

    [Column("include_in_total")]
    public bool IncludeInTotal { get; set; }

    [Column("virtual")]
    public bool Virtual { get; set; }

    [Column("formula")]
    public string? Formula { get; set; }

    [Column("formula_object")]
    public string? FormulaObject { get; set; }

    [ForeignKey(nameof(CourseId))]
    public Course? Course { get; set; }


    [ForeignKey(nameof(TaskSetTypeId))]   
    public TaskSetType TaskSetType { get; set; } = null!;

    
    
}
