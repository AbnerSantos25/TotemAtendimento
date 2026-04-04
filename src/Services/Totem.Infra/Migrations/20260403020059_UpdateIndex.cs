using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceTypes_TicketPrefix",
                schema: "Totem",
                table: "ServiceTypes");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTypes_TicketPrefix",
                schema: "Totem",
                table: "ServiceTypes",
                column: "TicketPrefix");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceTypes_TicketPrefix",
                schema: "Totem",
                table: "ServiceTypes");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTypes_TicketPrefix",
                schema: "Totem",
                table: "ServiceTypes",
                column: "TicketPrefix",
                unique: true);
        }
    }
}
