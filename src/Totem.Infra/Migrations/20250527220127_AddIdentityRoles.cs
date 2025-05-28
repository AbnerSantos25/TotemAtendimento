using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentityRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Action",
                schema: "Totem",
                table: "PasswordHistory");

            migrationBuilder.AddColumn<string>(
                name: "PasswordHistoryEventType",
                schema: "Totem",
                table: "PasswordHistory",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHistoryEventType",
                schema: "Totem",
                table: "PasswordHistory");

            migrationBuilder.AddColumn<string>(
                name: "Action",
                schema: "Totem",
                table: "PasswordHistory",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "");
        }
    }
}
