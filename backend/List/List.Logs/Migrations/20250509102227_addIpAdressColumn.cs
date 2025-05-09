using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Logs.Migrations
{
    /// <inheritdoc />
    public partial class addIpAdressColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ip",
                table: "logs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ip",
                table: "logs");
        }
    }
}
