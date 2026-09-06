DROP TABLE IF EXISTS `neighborhoods`;
DROP TABLE IF EXISTS `municipalities`;
DROP TABLE IF EXISTS `states`;
DROP TABLE IF EXISTS `regions`;
DROP TABLE IF EXISTS `crimes`;

CREATE TABLE IF NOT EXISTS `regions`(
    `region_id` INT AUTO_INCREMENT PRIMARY KEY,
    `region_name` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `states`(
    `uf_id` INT AUTO_INCREMENT PRIMARY KEY,
    `uf_name` VARCHAR(255) NOT NULL,
    `region_id` INT NOT NULL,
    `acronym` VARCHAR(2) NOT NULL,
    FOREIGN KEY (`region_id`) REFERENCES `regions`(`region_id`)
);


CREATE TABLE IF NOT EXISTS `municipalities`(
    `ibge_id` INT PRIMARY KEY,
    `municipality_name` VARCHAR(255) NOT NULL,
    `area_km2` DECIMAL(12, 3) NOT NULL,
    `population` BIGINT NOT NULL,
    `uf_id` INT NOT NULL,
    FOREIGN KEY (`uf_id`) REFERENCES `states`(`uf_id`)
);

CREATE TABLE IF NOT EXISTS `neighborhoods`(
    `id` BIGINT PRIMARY KEY,
    `ibge_id` INT NOT NULL,
    `neighborhood_name` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`ibge_id`) REFERENCES `municipalities`(`ibge_id`)
);

DELETE FROM `neighborhoods`;

CREATE TABLE IF NOT EXISTS `crimes`(
    `crime_id` INT AUTO_INCREMENT PRIMARY KEY,
    `ibge_id` INT NOT NULL,
    `reference_datetime` DATETIME NOT NULL,
    `crime_type` VARCHAR(255) NOT NULL,
    `severity` VARCHAR(50) NOT NULL,
    `neighborhood_id` BIGINT NOT NULL,
    FOREIGN KEY (`ibge_id`) REFERENCES `municipalities`(`ibge_id`),
    FOREIGN KEY (`neighborhood_id`) REFERENCES `neighborhoods`(`id`)
);