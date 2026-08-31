ALTER TABLE tasks ADD COLUMN reminder_at TIMESTAMP;
ALTER TABLE tasks ADD COLUMN reminder_repeat_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN reminder_max_occurrences INTEGER;
ALTER TABLE tasks ADD COLUMN reminder_read BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE tasks ADD CONSTRAINT chk_task_reminder_repeat
    CHECK (reminder_repeat_minutes IS NULL OR reminder_repeat_minutes BETWEEN 2 AND 10080);
ALTER TABLE tasks ADD CONSTRAINT chk_task_reminder_occurrences
    CHECK (reminder_max_occurrences IS NULL OR reminder_max_occurrences BETWEEN 1 AND 3);
