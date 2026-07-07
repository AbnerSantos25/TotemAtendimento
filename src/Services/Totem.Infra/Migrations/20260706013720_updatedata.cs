using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class updatedata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Passwords_Queues_QueueId",
                schema: "Totem",
                table: "Passwords");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                schema: "Totem",
                table: "Queues",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddForeignKey(
                name: "FK_Passwords_Queues_QueueId",
                schema: "Totem",
                table: "Passwords",
                column: "QueueId",
                principalSchema: "Totem",
                principalTable: "Queues",
                principalColumn: "QueueId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Passwords_Queues_QueueId",
                schema: "Totem",
                table: "Passwords");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                schema: "Totem",
                table: "Queues",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Passwords_Queues_QueueId",
                schema: "Totem",
                table: "Passwords",
                column: "QueueId",
                principalSchema: "Totem",
                principalTable: "Queues",
                principalColumn: "QueueId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
