package com.leito.taskmanager.dailypriority.api;
import com.leito.taskmanager.dailypriority.application.DailyPriorityService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.security.Principal; import java.util.List;
@RestController @RequestMapping("/api/daily-priorities")
public class DailyPriorityController {
 private final DailyPriorityService service;
 public DailyPriorityController(DailyPriorityService service) { this.service=service; }
 @GetMapping public List<DailyPriorityResponse> findToday(Principal p) { return service.findToday(p.getName()); }
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public DailyPriorityResponse add(@Valid @RequestBody CreateDailyPriorityRequest r, Principal p) { return service.add(r.taskId(),p.getName()); }
 @DeleteMapping("/{taskId}") public ResponseEntity<Void> remove(@PathVariable Long taskId,Principal p) { service.remove(taskId,p.getName()); return ResponseEntity.noContent().build(); }
}
