using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Assignments.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherToAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "teacher_id",
                table: "assignments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_assignments_teacher_id",
                table: "assignments",
                column: "teacher_id");

            migrationBuilder.AddForeignKey(
                name: "FK_assignments_Users_teacher_id",
                table: "assignments",
                column: "teacher_id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_assignments_Users_teacher_id",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_teacher_id",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "teacher_id",
                table: "assignments");
        }
    }
}
