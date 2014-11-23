library(dplyr)
library(lubridate)
library(tidyr)
library(gridExtra)
library(ggplot2)
theme_set(theme_bw())

df <- read.csv('../nest.csv', stringsAsFactors=FALSE) %>%
  mutate(datetime=ymd_hms(datetime),
         heat_on=as.logical(heat_on)) %>%
  filter(datetime < ymd('2014-11-17'))

p.temp <- gather(df, var, value, temp_indoor:temp_target) %>%
  ggplot(aes(datetime, value, color=var)) +
  geom_line() +
  theme(legend.position='top')

p.heat <- ggplot(df, aes(datetime, heat_on)) +
  geom_point()

grid.arrange(p.temp, p.heat)

ggplot(df, aes(temp_target, temp_indoor, color=heat_on)) +
  geom_point() +
  geom_abline()

gather(df, var, value, temp_indoor:temp_target) %>%
  ggplot(aes(hour(datetime), value)) +
  geom_point() +
  facet_wrap(~var)

group_by(df, date=floor_date(datetime, unit='day')) %>%
  summarise(heat_on=sum(heat_on)/n()) %>%
  ggplot(aes(date, heat_on)) +
  geom_bar(stat='identity')