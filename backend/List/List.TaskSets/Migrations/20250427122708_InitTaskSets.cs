using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace List.TaskSets.Migrations
{
    /// <inheritdoc />
    public partial class InitTaskSets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "task_set_types",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    identifier = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_task_set_types", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "course_task_set_rel",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<int>(type: "integer", nullable: false),
                    task_set_type_id = table.Column<int>(type: "integer", nullable: false),
                    upload_solution = table.Column<bool>(type: "boolean", nullable: false),
                    min_points = table.Column<double>(type: "double precision", nullable: true),
                    min_points_in_percentage = table.Column<bool>(type: "boolean", nullable: false),
                    include_in_total = table.Column<bool>(type: "boolean", nullable: false),
                    @virtual = table.Column<bool>(name: "virtual", type: "boolean", nullable: false),
                    formula = table.Column<string>(type: "text", nullable: true),
                    formula_object = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_course_task_set_rel", x => x.Id);
                    table.ForeignKey(
                        name: "FK_course_task_set_rel_task_set_types_task_set_type_id",
                        column: x => x.task_set_type_id,
                        principalTable: "task_set_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_course_task_set_rel_course_id_task_set_type_id",
                table: "course_task_set_rel",
                columns: new[] { "course_id", "task_set_type_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_course_task_set_rel_task_set_type_id",
                table: "course_task_set_rel",
                column: "task_set_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_set_types_identifier",
                table: "task_set_types",
                column: "identifier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_task_set_types_name",
                table: "task_set_types",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "course_task_set_rel");

            migrationBuilder.DropTable(
                name: "task_set_types");
        }
    }
}
