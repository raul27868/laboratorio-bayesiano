import { PROJECT_VERSION, initLaboratory } from './laboratory.js';
import { initActivity } from './activity.js';

document.documentElement.dataset.version = PROJECT_VERSION;
initLaboratory();
initActivity();
