using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSetNullBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Periods_PeriodId",
                table: "Courses");

            migrationBuilder.AlterColumn<int>(
                name: "PeriodId",
                table: "Courses",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Periods_PeriodId",
                table: "Courses",
                column: "PeriodId",
                principalTable: "Periods",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Periods_PeriodId",
                table: "Courses");

            migrationBuilder.AlterColumn<int>(
                name: "PeriodId",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Periods_PeriodId",
                table: "Courses",
                column: "PeriodId",
                principalTable: "Periods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
