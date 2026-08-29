ALTER TABLE projects ADD COLUMN icon VARCHAR(20) NOT NULL DEFAULT 'folder';
ALTER TABLE projects ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#6D5CE7';

ALTER TABLE projects ADD CONSTRAINT chk_projects_icon
    CHECK (icon IN ('work', 'study', 'personal', 'health', 'finance', 'code', 'creative', 'folder'));
ALTER TABLE projects ADD CONSTRAINT chk_projects_color
    CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
