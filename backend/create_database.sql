-- Create the database for the exam platform
CREATE DATABASE IF NOT EXISTS exam_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE exam_platform;

-- Grant privileges (adjust username/password as needed)
-- GRANT ALL PRIVILEGES ON exam_platform.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

-- Show confirmation
SELECT 'Database exam_platform created successfully!' AS message;
