using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class UpdateServiceTypePropertiesMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "TicketPrefix",
                schema: "Totem",
                table: "ServiceTypes",
                type: "varchar(100)",
                maxLength: 3,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTypes_Title",
                schema: "Totem",
                table: "ServiceTypes",
                column: "Title");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceTypes_Title",
                schema: "Totem",
                table: "ServiceTypes");

            migrationBuilder.AlterColumn<string>(
                name: "TicketPrefix",
                schema: "Totem",
                table: "ServiceTypes",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 3,
                oldNullable: true);
        }
    }
}
