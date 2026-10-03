CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    stock INT NOT NULL DEFAULT 0,
    image MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample products
INSERT INTO products (name, price, description, stock, image) VALUES
('Laptop Lenovo LOQ', 13000000, 'Laptop gaming dengan spesifikasi tinggi', 100, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
('Asus Vivobook', 5000000, 'Laptop ringan dengan spesifikasi menengah', 50, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
('Acer Aspire', 4000000, 'Laptop dengan spesifikasi menengah', 200, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');