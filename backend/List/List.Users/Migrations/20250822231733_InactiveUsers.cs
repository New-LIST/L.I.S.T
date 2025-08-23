using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Users.Migrations
{
    /// <inheritdoc />
    public partial class InactiveUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "inactive ",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "inactive ",
                table: "Users");
        }
    }
}
