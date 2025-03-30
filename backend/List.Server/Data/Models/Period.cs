using System.Text.Json.Serialization;

namespace List.Server.Data.Models
{
    public class Period
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        
        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}