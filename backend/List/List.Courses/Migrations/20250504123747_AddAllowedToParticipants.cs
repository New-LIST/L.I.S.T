using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Courses.Migrations
{
    /// <inheritdoc />
    public partial class AddAllowedToParticipants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "allowed",
                table: "participants",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "allowed",
                table: "participants");
        }
    }
}
