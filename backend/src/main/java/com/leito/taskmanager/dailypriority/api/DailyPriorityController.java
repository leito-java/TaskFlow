package com.leito.taskmanager.dailypriority.api;

import com.leito.taskmanager.dailypriority.application.DailyPriorityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/daily-priorities")
public class DailyPriorityController {
    private final DailyPriorityService service;

    public DailyPriorityController(DailyPriorityService service) {
        this.service = service;
    }

    @GetMapping
    public List<DailyPriorityResponse> findToday(Principal principal) {
        return service.findToday(principal.getName());
    }

    @GetMapping("/suggestions")
    public List<DailyPrioritySuggestionResponse> findSuggestions(Principal principal) {
        return service.findYesterdaySuggestions(principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DailyPriorityResponse add(
            @Valid @RequestBody CreateDailyPriorityRequest request,
            Principal principal
    ) {
        return service.add(request.taskId(), principal.getName());
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> remove(@PathVariable Long taskId, Principal principal) {
        service.remove(taskId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
