package com.leito.taskmanager.dailypriority.domain;

import com.leito.taskmanager.task.domain.Task;
import com.leito.taskmanager.user.domain.User;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name = "daily_priorities")
public class DailyPriority {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) @JoinColumn(name = "owner_id") private User owner;
  @ManyToOne(optional = false) @JoinColumn(name = "task_id") private Task task;
  @Column(name = "priority_date") private LocalDate priorityDate;
  private int position;
  protected DailyPriority() { }
  public DailyPriority(User owner, Task task, LocalDate priorityDate, int position) { this.owner=owner; this.task=task; this.priorityDate=priorityDate; this.position=position; }
  public Long getId() { return id; } public Task getTask() { return task; } public int getPosition() { return position; }
  public LocalDate getPriorityDate() { return priorityDate; }
  public void moveTo(int position) { this.position = position; }
}
