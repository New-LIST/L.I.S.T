// List.Assignments/DTOs/GradeMatrixDto.cs
using System;
using System.Collections.Generic;

namespace List.Assignments.DTOs
{
    public class GradeMatrixDto
    {
        public int CourseId      { get; set; }
        public string CourseName { get; set; } = null!;
        public string PeriodName { get; set; } = null!;
        public List<GradeMatrixTypeDto> Types    { get; set; } = new();
        public List<StudentGradeDto>     Students { get; set; } = new();
    }

    public class GradeMatrixTypeDto
    {
        public int RelId              { get; set; } 
        public int TaskSetTypeId      { get; set; }
        public string TaskSetTypeName { get; set; }    
        public bool Virtual           { get; set; }
        public double? MinPoints      { get; set; }
        public bool MinPointsInPercentage { get; set; }
        public bool IncludeInTotal    { get; set; }
        public double MaxPoints          { get; set; }

        public List<AssignmentInfoDto> Assignments { get; set; } = new();
    }

    public class AssignmentInfoDto
    {
        public int    AssignmentId   { get; set; }
        public string AssignmentName { get; set; } = null!;
    }

    public class StudentGradeDto
    {
        public int StudentId { get; set; }
        public string FullName { get; set; } = null!;
        public string? Group { get; set; }

        public Dictionary<int, double?> Points { get; set; } = new();
        
        public Dictionary<int, double> SectionTotals { get; set; } = new();
    }
}
