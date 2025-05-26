using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace List.Users.Migrations
{
    /// <inheritdoc />
    public partial class AssistantPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "assistant_permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    can_add_students = table.Column<bool>(type: "boolean", nullable: false),
                    can_manage_students = table.Column<bool>(type: "boolean", nullable: false),
                    can_manage_task_types = table.Column<bool>(type: "boolean", nullable: false),
                    can_manage_periods = table.Column<bool>(type: "boolean", nullable: false),
                    can_manage_categories = table.Column<bool>(type: "boolean", nullable: false),
                    can_view_logs = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assistant_permissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_assistant_permissions_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_assistant_permissions_user_id",
                table: "assistant_permissions",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assistant_permissions");
        }
    }
}
