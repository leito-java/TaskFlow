package com.leito.taskmanager.dailypriority.application;

import com.leito.taskmanager.dailypriority.api.DailyPriorityResponse;
import com.leito.taskmanager.dailypriority.domain.DailyPriority;
import com.leito.taskmanager.dailypriority.infrastructure.DailyPriorityRepository;
import com.leito.taskmanager.task.infrastructure.TaskRepository;
import com.leito.taskmanager.user.application.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate; import java.util.List;

@Service @Transactional(readOnly = true)
public class DailyPriorityService {
 private final DailyPriorityRepository priorities; private final TaskRepository tasks; private final UserService users;
 public DailyPriorityService(DailyPriorityRepository priorities, TaskRepository tasks, UserService users) { this.priorities=priorities; this.tasks=tasks; this.users=users; }
 public List<DailyPriorityResponse> findToday(String email) { return entities(email).stream().map(DailyPriorityResponse::from).toList(); }
 @Transactional public DailyPriorityResponse add(Long taskId, String email) {
  LocalDate today=LocalDate.now(); long count=priorities.countByOwnerEmailAndPriorityDate(email,today);
  if (count >= 3) throw new IllegalStateException("Maximum de trois priorités atteint");
  if (priorities.findByTaskIdAndOwnerEmailAndPriorityDate(taskId,email,today).isPresent()) throw new IllegalArgumentException("Tâche déjà sélectionnée");
  var task=tasks.findByIdAndOwnerEmail(taskId,email).orElseThrow(() -> new IllegalArgumentException("Tâche introuvable"));
  return DailyPriorityResponse.from(priorities.save(new DailyPriority(users.findByEmail(email),task,today,(int)count+1)));
 }
 @Transactional public void remove(Long taskId,String email) {
  DailyPriority p=priorities.findByTaskIdAndOwnerEmailAndPriorityDate(taskId,email,LocalDate.now()).orElseThrow(() -> new IllegalArgumentException("Priorité introuvable"));
  priorities.delete(p); List<DailyPriority> remaining=entities(email); for(int i=0;i<remaining.size();i++) remaining.get(i).moveTo(i+1);
 }
 private List<DailyPriority> entities(String email) { return priorities.findAllByOwnerEmailAndPriorityDateOrderByPositionAsc(email,LocalDate.now()); }
}
