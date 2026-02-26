using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class UpdateServiceTypeProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Color",
                schema: "Totem",
                table: "ServiceTypes",
                type: "varchar(7)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(7)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Color",
                schema: "Totem",
                table: "ServiceTypes",
                type: "varchar(7)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(7)",
                oldNullable: true);
        }
    }
}
