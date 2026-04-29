import type { DataSource } from '../types';
import { geografia } from './geografia';
import { poblacion } from './poblacion';
import { ambiental } from './ambiental';
import { social } from './social';
import { economica } from './economica';
import { gobernanza } from './gobernanza';
import { sostenibilidad } from './sostenibilidad';
import { sroi } from './sroi';

export const DATA_SOURCE_OF_TRUTH: DataSource = {
  geografia,
  poblacion,
  ambiental,
  social,
  economica,
  gobernanza,
  sostenibilidad,
  sroi,
};

export { geografia, poblacion, ambiental, social, economica, gobernanza, sostenibilidad, sroi };
