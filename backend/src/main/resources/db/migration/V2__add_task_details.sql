ALTER TABLE tasks
    ADD COLUMN description VARCHAR(1000);

ALTER TABLE tasks
    ADD COLUMN status VARCHAR(20);

ALTER TABLE tasks
    ADD COLUMN due_date DATE;

UPDATE tasks
SET status = CASE
    WHEN completed = TRUE THEN 'DONE'
    ELSE 'TODO'
END;

ALTER TABLE tasks
    ALTER COLUMN status SET NOT NULL;

ALTER TABLE tasks
    ADD CONSTRAINT chk_tasks_status CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE'));

ALTER TABLE tasks
    DROP COLUMN completed;
