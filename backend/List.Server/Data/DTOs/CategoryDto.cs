namespace List.Server.Data.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<CategoryDto> Children { get; set; } = new();
    }
}
