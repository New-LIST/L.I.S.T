using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Courses.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToCourses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "Courses",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "image_url",
                table: "Courses");
        }
    }
}
