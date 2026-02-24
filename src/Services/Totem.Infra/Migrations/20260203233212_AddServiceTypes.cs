using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "Totem",
                table: "ServiceLocations",
                newName: "ServiceLocationId");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "Totem",
                table: "Queues",
                newName: "QueueId");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "Totem",
                table: "Passwords",
                newName: "PasswordId");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "Totem",
                table: "PasswordHistory",
                newName: "PasswordHistoryId");

            migrationBuilder.CreateTable(
                name: "ServiceTypes",
                schema: "Totem",
                columns: table => new
                {
                    ServiceTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "varchar(100)", nullable: false),
                    Icon = table.Column<string>(type: "varchar(100)", nullable: true),
                    Color = table.Column<string>(type: "varchar(100)", maxLength: 7, nullable: false),
                    TicketPrefix = table.Column<string>(type: "varchar(100)", nullable: false),
                    TargetQueueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceTypes", x => x.ServiceTypeId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTypes_TicketPrefix",
                schema: "Totem",
                table: "ServiceTypes",
                column: "TicketPrefix",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTypes_Title_TargetQueueId",
                schema: "Totem",
                table: "ServiceTypes",
                columns: new[] { "Title", "TargetQueueId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceTypes",
                schema: "Totem");

            migrationBuilder.RenameColumn(
                name: "ServiceLocationId",
                schema: "Totem",
                table: "ServiceLocations",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "QueueId",
                schema: "Totem",
                table: "Queues",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "PasswordId",
                schema: "Totem",
                table: "Passwords",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "PasswordHistoryId",
                schema: "Totem",
                table: "PasswordHistory",
                newName: "Id");
        }
    }
}
