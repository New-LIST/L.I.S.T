using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Assignments.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseTaskSetRelForeignKeyToAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_assignments_course_id",
                table: "assignments");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_course_id_task_set_type_id",
                table: "assignments",
                columns: new[] { "course_id", "task_set_type_id" });

            migrationBuilder.AddForeignKey(
                name: "FK_assignments_course_task_set_rel_course_id_task_set_type_id",
                table: "assignments",
                columns: new[] { "course_id", "task_set_type_id" },
                principalTable: "course_task_set_rel",
                principalColumns: new[] { "course_id", "task_set_type_id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_assignments_course_task_set_rel_course_id_task_set_type_id",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_course_id_task_set_type_id",
                table: "assignments");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_course_id",
                table: "assignments",
                column: "course_id");
        }
    }
}
