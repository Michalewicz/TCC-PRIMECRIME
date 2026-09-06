-- Auto-generated seed data

-- regions
INSERT INTO `regions` (`region_id`, `region_name`) VALUES (2, 'Nordeste');
INSERT INTO `regions` (`region_id`, `region_name`) VALUES (4, 'Sul');
INSERT INTO `regions` (`region_id`, `region_name`) VALUES (3, 'Sudeste');
INSERT INTO `regions` (`region_id`, `region_name`) VALUES (5, 'Centro-oeste');
INSERT INTO `regions` (`region_id`, `region_name`) VALUES (1, 'Norte');

-- states
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (24, 'Rio Grande do Norte', 2, 'RN');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (42, 'Santa Catarina', 4, 'SC');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (43, 'Rio Grande do Sul', 4, 'RS');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (31, 'Minas Gerais', 3, 'MG');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (52, 'Goiás', 5, 'GO');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (35, 'São Paulo', 3, 'SP');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (41, 'Paraná', 4, 'PR');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (29, 'Bahia', 2, 'BA');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (22, 'Piauí', 2, 'PI');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (25, 'Paraíba', 2, 'PB');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (21, 'Maranhão', 2, 'MA');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (27, 'Alagoas', 2, 'AL');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (51, 'Mato Grosso', 5, 'MT');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (23, 'Ceará', 2, 'CE');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (50, 'Mato Grosso do Sul', 5, 'MS');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (15, 'Pará', 1, 'PA');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (17, 'Tocantins', 1, 'TO');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (28, 'Sergipe', 2, 'SE');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (14, 'Roraima', 1, 'RR');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (26, 'Pernambuco', 2, 'PE');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (33, 'Rio de Janeiro', 3, 'RJ');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (13, 'Amazonas', 1, 'AM');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (53, 'Distrito Federal', 5, 'DF');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (32, 'Espírito Santo', 3, 'ES');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (12, 'Acre', 1, 'AC');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (11, 'Rondônia', 1, 'RO');
INSERT INTO `states` (`uf_id`, `uf_name`, `region_id`, `acronym`) VALUES (16, 'Amapá', 1, 'AP');

-- municipalities
INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) VALUES (3551009, 'São Vicente', 147.774, 324205, 35);
INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) VALUES (3541000, 'Praia Grande', 149.652, 348540, 35);
INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) VALUES (3548500, 'Santos', 281.033, 416817, 35);
INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) VALUES (3506359, 'Bertioga', 491.546, 63985, 35);
INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) VALUES (3531100, 'Mongaguá', 142.521, 59169, 35);
INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) VALUES (3513504, 'Cubatão', 143.649, 112397, 35);
INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) VALUES (3522109, 'Itanhaém', 601.018, 112223, 35);
INSERT INTO `municipalities` (`ibge_id`, `municipality_name`, `area_km2`, `population`, `uf_id`) VALUES (3518701, 'Guarujá', 144.794, 287098, 35);