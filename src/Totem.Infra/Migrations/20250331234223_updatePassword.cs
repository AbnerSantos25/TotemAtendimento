using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Totem.Infra.Migrations
{
    /// <inheritdoc />
    public partial class updatePassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "QueueId",
                schema: "Totem",
                table: "Passwords",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Code",
                schema: "Totem",
                table: "Passwords",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)");


            migrationBuilder.Sql("CREATE SEQUENCE PasswordSequence START WITH 1 INCREMENT BY 1");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "QueueId",
                schema: "Totem",
                table: "Passwords",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                schema: "Totem",
                table: "Passwords",
                type: "varchar(100)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.Sql("DROP SEQUENCE PasswordSequence");

        }
    }
}
