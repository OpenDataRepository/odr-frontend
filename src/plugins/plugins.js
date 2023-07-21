var chemistryV0_1 = require('./field_plugins/chemistry/0.1/plugin');
var graphV0_1 = require('./dataset_plugins/graph/0.1/plugin');

module.exports = {
  field_plugins: {
    chemistry: {
      0.1: chemistryV0_1
    }
  },
  dataset_plugins: {
    graph: {
      0.1: graphV0_1
    }
  }
};
