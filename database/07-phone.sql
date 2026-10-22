-- Add customer phone for existing installations.
USE cinema;
SET @has_phone := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='bookings' AND column_name='customer_phone');
SET @phone_sql := IF(@has_phone=0, 'ALTER TABLE bookings ADD COLUMN customer_phone VARCHAR(20) NOT NULL DEFAULT '' AFTER customer_email', 'SELECT 1');
PREPARE phone_stmt FROM @phone_sql;
EXECUTE phone_stmt;
DEALLOCATE PREPARE phone_stmt;
