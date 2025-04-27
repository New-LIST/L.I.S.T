using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace List.Assignments.Migrations
{
    /// <inheritdoc />
    public partial class InitAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "assignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    task_set_type_id = table.Column<int>(type: "integer", nullable: false),
                    course_id = table.Column<int>(type: "integer", nullable: false),
                    Published = table.Column<bool>(type: "boolean", nullable: false),
                    PublishStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UploadEndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    PointsOverride = table.Column<double>(type: "double precision", nullable: true),
                    InternalComment = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_assignments_Courses_course_id",
                        column: x => x.course_id,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_assignments_task_set_types_task_set_type_id",
                        column: x => x.task_set_type_id,
                        principalTable: "task_set_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "assignment_task_rel",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "integer", nullable: false),
                    AssignmentId = table.Column<int>(type: "integer", nullable: false),
                    PointsTotal = table.Column<double>(type: "double precision", nullable: false),
                    BonusTask = table.Column<bool>(type: "boolean", nullable: false),
                    InternalComment = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assignment_task_rel", x => new { x.TaskId, x.AssignmentId });
                    table.ForeignKey(
                        name: "FK_assignment_task_rel_assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_assignment_task_rel_tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_assignment_task_rel_AssignmentId",
                table: "assignment_task_rel",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_course_id",
                table: "assignments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_task_set_type_id",
                table: "assignments",
                column: "task_set_type_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assignment_task_rel");

            migrationBuilder.DropTable(
                name: "assignments");
        }
    }
}
