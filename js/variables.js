'use strict';

var Geops = Geops || {};

Geops.LEVELS = {
  WORLD: 'WORLD',
  MISSION: 'MISSION',
  PROJECT: 'PROJECT' 
};

Geops.MISSIONS_COLORS = {
  'Indonesia': 'rgb(116, 196, 118)',
  'Italy': 'rgb(161, 217, 155)',
  'Kenya': 'rgb(199, 233, 192)',
  'Lebanon': 'rgb(117, 107, 177)',
  'Malawi': 'rgb(158, 154, 200)',
  'Mauritania': 'rgb(188, 189, 220)',
  'Pakistan': 'rgb(218, 218, 235)',
  'South Africa': 'rgb(99, 99, 99)',
  'Sudan South': 'rgb(150, 150, 150)',
  'Ukraine': 'rgb(189, 189, 189)',
  'Afghanistan': 'rgb(49, 130, 189)',
  'Burundi': 'rgb(107, 174, 214)',
  'Cambodia': 'rgb(158, 202, 225)',
  'CAR': 'rgb(198, 219, 239)',
  'DRC': 'rgb(230, 85, 13)',
  'Egypt': 'rgb(253, 141, 59)',
  'Greece': 'rgb(253, 174, 107)',
  'Guinea': 'rgb(253, 208, 162)',
  'Haiti': 'rgb(49, 163, 84)'
};

Geops.CONTEXTS = {
  1: 'Armed Conflict',
  2: 'Post-Conflict',
  3: 'Internal Instability',
  4: 'Stable'
};

Geops.POPULATION_TYPES = {
  1: 'Displaced',
  2: 'General Population',
  3: 'Mixed Displaced/General',
  4: 'Victims of Natural Disasters'
};

Geops.PROJECT_TYPES_COLORS = {
  'coordination': 'rgb(116, 196, 118)',
  'general hosp': 'rgb(161, 217, 155)',
  'surgery hosp': 'rgb(199, 233, 192)',
  'Lebanon': 'rgb(117, 107, 177)',
  'maternity': 'rgb(158, 154, 200)',
  'emergency': 'rgb(188, 189, 220)',
  'Pakistan': 'rgb(218, 218, 235)',
  'support': 'rgb(99, 99, 99)',
  'malaria': 'rgb(150, 150, 150)',
  'HIV': 'rgb(189, 189, 189)',
  'IDP/refugees': 'rgb(49, 130, 189)',
  'migrant': 'rgb(107, 174, 214)',
  'PHC': 'rgb(158, 202, 225)',
  'TB': 'rgb(198, 219, 239)',
  'Sexual violence': 'rgb(230, 85, 13)'
};
