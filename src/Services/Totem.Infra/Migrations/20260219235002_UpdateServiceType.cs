using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class UpdateServiceType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Color",
                schema: "Totem",
                table: "ServiceTypes",
                type: "varchar(7)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 7);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "Totem",
                table: "ServiceTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "Totem",
                table: "ServiceTypes");

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                schema: "Totem",
                table: "ServiceTypes",
                type: "varchar(100)",
                maxLength: 7,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(7)");
        }
    }
}
