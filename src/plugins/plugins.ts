import { ChemistryPlugin as chemistryV0_1 } from './field_plugins/chemistry/0.1/plugin';
import { TemperaturePlugin as temperatureV0_1 } from './field_plugins/temperature/0.1/plugin';
import { graphCsvBlob as graphV0_1 } from './dataset_plugins/graph/0.1/plugin';

const field_plugins: Record<string, any> = {
  chemistry: {
    0.1: chemistryV0_1
  },
  temperature: {
    0.1: temperatureV0_1
  }
};
const dataset_plugins: Record<string, any> = {
  graph: {
    0.1: graphV0_1
  }
};

export {
  field_plugins,
  dataset_plugins
};
