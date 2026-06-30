using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations.AppIdentityDb
{
    /// <inheritdoc />
    public partial class AddUserQueuePermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SysUserQueuePermissions",
                schema: "Identity",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QueueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SysUserQueuePermissions", x => new { x.UserId, x.QueueId });
                });

            migrationBuilder.CreateIndex(
                name: "IX_SysUserQueuePermissions_UserId",
                schema: "Identity",
                table: "SysUserQueuePermissions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SysUserQueuePermissions",
                schema: "Identity");
        }
    }
}
