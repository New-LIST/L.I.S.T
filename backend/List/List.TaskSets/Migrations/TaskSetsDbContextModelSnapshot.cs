﻿// <auto-generated />
using System;
using List.TaskSets.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace List.TaskSets.Migrations
{
    [DbContext(typeof(TaskSetsDbContext))]
    partial class TaskSetsDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("List.Courses.Models.Course", b =>
                {
                    b.Property<int>("Id")
                        .HasColumnType("integer");

                    b.Property<bool>("AutoAcceptStudents")
                        .HasColumnType("boolean");

                    b.Property<int>("Capacity")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("EnrollmentLimit")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTime?>("GroupChangeDeadline")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("HiddenInList")
                        .HasColumnType("boolean");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("PeriodId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.ToTable((string)null);
                });

            modelBuilder.Entity("List.TaskSets.Models.CourseTaskSetRel", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("CourseId")
                        .HasColumnType("integer")
                        .HasColumnName("course_id");

                    b.Property<string>("Formula")
                        .HasColumnType("text")
                        .HasColumnName("formula");

                    b.Property<string>("FormulaObject")
                        .HasColumnType("text")
                        .HasColumnName("formula_object");

                    b.Property<bool>("IncludeInTotal")
                        .HasColumnType("boolean")
                        .HasColumnName("include_in_total");

                    b.Property<double?>("MinPoints")
                        .HasColumnType("double precision")
                        .HasColumnName("min_points");

                    b.Property<bool>("MinPointsInPercentage")
                        .HasColumnType("boolean")
                        .HasColumnName("min_points_in_percentage");

                    b.Property<int>("TaskSetTypeId")
                        .HasColumnType("integer")
                        .HasColumnName("task_set_type_id");

                    b.Property<bool>("UploadSolution")
                        .HasColumnType("boolean")
                        .HasColumnName("upload_solution");

                    b.Property<bool>("Virtual")
                        .HasColumnType("boolean")
                        .HasColumnName("virtual");

                    b.HasKey("Id");

                    b.HasIndex("CourseId");

                    b.HasIndex("TaskSetTypeId");

                    b.ToTable("course_task_set_rel", (string)null);
                });

            modelBuilder.Entity("List.TaskSets.Models.TaskSetType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Identifier")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("identifier");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("name");

                    b.HasKey("Id");

                    b.HasIndex("Identifier")
                        .IsUnique();

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("task_set_types", (string)null);
                });

            modelBuilder.Entity("List.TaskSets.Models.CourseTaskSetRel", b =>
                {
                    b.HasOne("List.Courses.Models.Course", "Course")
                        .WithMany()
                        .HasForeignKey("CourseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("List.TaskSets.Models.TaskSetType", "TaskSetType")
                        .WithMany()
                        .HasForeignKey("TaskSetTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Course");

                    b.Navigation("TaskSetType");
                });
#pragma warning restore 612, 618
        }
    }
}
