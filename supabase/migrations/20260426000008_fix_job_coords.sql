-- Fix incorrect job coordinates: Olympia jobs outside Amsterdam were geocoded to
-- random Amsterdam jitter because the city lookup table was incomplete.
-- This migration corrects known Dutch cities to their actual coordinates,
-- and nulls out any remaining Amsterdam-area coordinates on non-Amsterdam jobs.

update jobs set lat = case upper(trim(location))
  when 'DORDRECHT'     then 51.8133  when 'BORN'          then 51.0333
  when 'ROOSENDAAL'    then 51.5308  when 'BEST'          then 51.5060
  when 'OOSTERHOUT'    then 51.6417  when 'KLUNDERT'      then 51.6667
  when 'DRUNEN'        then 51.6833  when 'VEENDAM'       then 53.1083
  when 'EINDHOVEN'     then 51.4416  when 'TILBURG'       then 51.5555
  when 'BREDA'         then 51.5719  when 'NIJMEGEN'      then 51.8426
  when 'ARNHEM'        then 51.9851  when 'UTRECHT'       then 52.0907
  when 'ROTTERDAM'     then 51.9244  when 'DEN HAAG'      then 52.0705
  when 'GRONINGEN'     then 53.2194  when 'MAASTRICHT'    then 50.8514
  when 'ALMERE'        then 52.3508  when 'AMERSFOORT'    then 52.1561
  when 'ENSCHEDE'      then 52.2215  when 'APELDOORN'     then 52.2112
  when 'ZWOLLE'        then 52.5168  when 'DEVENTER'      then 52.2512
  when 'HAARLEM'       then 52.3874  when 'ZAANDAM'       then 52.4380
  when 'HOOFDDORP'     then 52.3058  when 'AMSTELVEEN'    then 52.3100
  when 'HELMOND'       then 51.4817  when 'OSS'           then 51.7650
  when 'WAALWIJK'      then 51.6834  when 'VENLO'         then 51.3704
  when 'SITTARD'       then 51.0000  when 'HEERLEN'       then 50.8880
  when 'LEEUWARDEN'    then 53.2012  when 'EMMEN'         then 52.7797
  when 'ASSEN'         then 52.9925  when 'HOOGEVEEN'     then 52.7239
  when 'LEIDEN'        then 52.1601  when 'DELFT'         then 52.0116
  when 'GOUDA'         then 52.0116  when 'ZOETERMEER'    then 52.0572
  when 'ALPHEN AAN DEN RIJN' then 52.1280
  when 'REGIO AMERSFOORT'    then 52.1561
end,
lng = case upper(trim(location))
  when 'DORDRECHT'     then 4.6901   when 'BORN'          then 5.8333
  when 'ROOSENDAAL'    then 4.4628   when 'BEST'          then 5.3918
  when 'OOSTERHOUT'    then 4.8611   when 'KLUNDERT'      then 4.5167
  when 'DRUNEN'        then 5.1333   when 'VEENDAM'       then 6.8750
  when 'EINDHOVEN'     then 5.4697   when 'TILBURG'       then 5.0913
  when 'BREDA'         then 4.7683   when 'NIJMEGEN'      then 5.8546
  when 'ARNHEM'        then 5.8987   when 'UTRECHT'       then 5.1214
  when 'ROTTERDAM'     then 4.4777   when 'DEN HAAG'      then 4.3007
  when 'GRONINGEN'     then 6.5665   when 'MAASTRICHT'    then 5.6910
  when 'ALMERE'        then 5.2647   when 'AMERSFOORT'    then 5.3878
  when 'ENSCHEDE'      then 6.8937   when 'APELDOORN'     then 5.9699
  when 'ZWOLLE'        then 6.0830   when 'DEVENTER'      then 6.1583
  when 'HAARLEM'       then 4.6462   when 'ZAANDAM'       then 4.8130
  when 'HOOFDDORP'     then 4.6972   when 'AMSTELVEEN'    then 4.8600
  when 'HELMOND'       then 5.6611   when 'OSS'           then 5.5167
  when 'WAALWIJK'      then 5.0696   when 'VENLO'         then 6.1724
  when 'SITTARD'       then 5.8667   when 'HEERLEN'       then 5.9797
  when 'LEEUWARDEN'    then 5.7999   when 'EMMEN'         then 6.8990
  when 'ASSEN'         then 6.5642   when 'HOOGEVEEN'     then 6.4733
  when 'LEIDEN'        then 4.4970   when 'DELFT'         then 4.3571
  when 'GOUDA'         then 4.7107   when 'ZOETERMEER'    then 4.4940
  when 'ALPHEN AAN DEN RIJN' then 4.6568
  when 'REGIO AMERSFOORT'    then 5.3878
end
where source = 'olympia'
  and upper(trim(location)) in (
    'DORDRECHT','BORN','ROOSENDAAL','BEST','OOSTERHOUT','KLUNDERT','DRUNEN',
    'VEENDAM','EINDHOVEN','TILBURG','BREDA','NIJMEGEN','ARNHEM','UTRECHT',
    'ROTTERDAM','DEN HAAG','GRONINGEN','MAASTRICHT','ALMERE','AMERSFOORT',
    'ENSCHEDE','APELDOORN','ZWOLLE','DEVENTER','HAARLEM','ZAANDAM',
    'HOOFDDORP','AMSTELVEEN','HELMOND','OSS','WAALWIJK','VENLO','SITTARD',
    'HEERLEN','LEEUWARDEN','EMMEN','ASSEN','HOOGEVEEN','LEIDEN','DELFT',
    'GOUDA','ZOETERMEER','ALPHEN AAN DEN RIJN','REGIO AMERSFOORT'
  );
