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
                    created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    task_set_type_id = table.Column<int>(type: "integer", nullable: false),
                    course_id = table.Column<int>(type: "integer", nullable: false),
                    published = table.Column<bool>(type: "boolean", nullable: false),
                    publish_start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    upload_end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    instructions = table.Column<string>(type: "text", nullable: true),
                    points_override = table.Column<double>(type: "double precision", nullable: true),
                    internal_comment = table.Column<string>(type: "text", nullable: true)
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
                    task_id = table.Column<int>(type: "integer", nullable: false),
                    assignment_id = table.Column<int>(type: "integer", nullable: false),
                    points_total = table.Column<double>(type: "double precision", nullable: false),
                    bonus = table.Column<bool>(type: "boolean", nullable: false),
                    internal_comment = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assignment_task_rel", x => new { x.task_id, x.assignment_id });
                    table.ForeignKey(
                        name: "FK_assignment_task_rel_assignments_assignment_id",
                        column: x => x.assignment_id,
                        principalTable: "assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_assignment_task_rel_tasks_task_id",
                        column: x => x.task_id,
                        principalTable: "tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_assignment_task_rel_assignment_id",
                table: "assignment_task_rel",
                column: "assignment_id");

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
