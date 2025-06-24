using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ServiceLocationId",
                schema: "Totem",
                table: "Queues",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                schema: "Totem",
                table: "Passwords",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Queues_ServiceLocationId",
                schema: "Totem",
                table: "Queues",
                column: "ServiceLocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Queues_ServiceLocations_ServiceLocationId",
                schema: "Totem",
                table: "Queues",
                column: "ServiceLocationId",
                principalSchema: "Totem",
                principalTable: "ServiceLocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Queues_ServiceLocations_ServiceLocationId",
                schema: "Totem",
                table: "Queues");

            migrationBuilder.DropIndex(
                name: "IX_Queues_ServiceLocationId",
                schema: "Totem",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "ServiceLocationId",
                schema: "Totem",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                schema: "Totem",
                table: "Passwords");
        }
    }
}
