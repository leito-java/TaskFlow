package com.leito.taskmanager.dailypriority.infrastructure;
import com.leito.taskmanager.dailypriority.domain.DailyPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate; import java.util.*;
public interface DailyPriorityRepository extends JpaRepository<DailyPriority, Long> {
 List<DailyPriority> findAllByOwnerEmailAndPriorityDateOrderByPositionAsc(String email, LocalDate date);
 long countByOwnerEmailAndPriorityDate(String email, LocalDate date);
 Optional<DailyPriority> findByTaskIdAndOwnerEmailAndPriorityDate(Long taskId, String email, LocalDate date);
}
