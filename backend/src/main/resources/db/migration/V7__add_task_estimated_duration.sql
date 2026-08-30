ALTER TABLE tasks
  ADD COLUMN estimated_minutes INTEGER;

ALTER TABLE tasks
  ADD CONSTRAINT chk_tasks_estimated_minutes
  CHECK (estimated_minutes IS NULL OR estimated_minutes BETWEEN 5 AND 1440);
