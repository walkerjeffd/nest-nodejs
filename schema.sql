DROP TABLE IF EXISTS nest;

CREATE TABLE nest (
  id serial PRIMARY KEY,
  datetime timestamp,
  temp_indoor real,
  temp_outdoor real,
  temp_target real,
  status json
)
