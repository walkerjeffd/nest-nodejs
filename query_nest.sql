copy (select datetime, temp_indoor, temp_outdoor, temp_target, status->>'hvac_heater_state' as heat_on 
      from nest)
to stdout CSV HEADER;
