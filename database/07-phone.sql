-- Add customer phone for existing installations.
USE cinema;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) NOT NULL DEFAULT '' AFTER customer_email;
