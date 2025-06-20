using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Tasks.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskParentRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "parent_task_id",
                table: "tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tasks_parent_task_id",
                table: "tasks",
                column: "parent_task_id");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_tasks_parent_task_id",
                table: "tasks",
                column: "parent_task_id",
                principalTable: "tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tasks_tasks_parent_task_id",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_tasks_parent_task_id",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "parent_task_id",
                table: "tasks");
        }
    }
}
