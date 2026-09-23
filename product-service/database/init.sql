CREATE DATABASE IF NOT EXISTS products (
    id int PRIMARY KEY,
    name varchar(255) NOT NULL,
    price decimal(10, 2) NOT NULL,
    description text,
    stock int not NULL default 0,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
)
-- Data contoh
insert into products (id, name, description, price, stock) values
(1, 'keybord mekanikal', 'Deskripsi untuk Keyboard Mekanikal', 150000.00, 10),
(2, 'mouse gaming', 'Deskripsi untuk Mouse Gaming', 75000.00, 20),
(3, 'headset gaming', 'Deskripsi untuk Headset Gaming', 200000.00, 15),
(4, 'monitor 24 inch', 'Deskripsi untuk Monitor 24 Inch', 1200000.00, 5),
(5, 'ram 16GB', 'Deskripsi untuk RAM 16GB', 800000.00, 8);-