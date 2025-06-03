using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Logs.Migrations
{
    /// <inheritdoc />
    public partial class AddLogTextColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "text",
                table: "logs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "text",
                table: "logs");
        }
    }
}
