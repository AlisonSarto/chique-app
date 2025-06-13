CREATE TABLE drinks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  store ENUM('Drinks Clássicos', 'Drinks Temáticos', 'Drinks Shakes') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  image LONGBLOB
);

CREATE TABLE customers (
  `phone` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `Drinks Clássicos` VARCHAR(45) DEFAULT 'false',
  `Drinks Temáticos` VARCHAR(45) DEFAULT 'false',
  `Drinks Shakes` VARCHAR(45) DEFAULT 'false',
  `fidelidade_brinde` ENUM('false','true') DEFAULT 'false';
  PRIMARY KEY (`phone`)
);

CREATE TABLE pedidos (
  `id` INT AUTO_INCREMENT NOT NULL,
  `loja` ENUM('Drinks Clássicos', 'Drinks Temáticos', 'Drinks Shakes') NOT NULL,
  `cliente_phone` VARCHAR(255) NOT NULL,
  `cliente_nome` VARCHAR(255) NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `valor_total` DECIMAL(10,2) NOT NULL,
  `created_at` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE itens_pedidos (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pedido_id` INT NOT NULL,
  `produto_id` INT NOT NULL,
  `quantidade` INT NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`)
);