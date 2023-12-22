import { GridStack } from 'gridstack';
import { NgGridStackOptions } from 'gridstack/dist/angular';

// TODO: convert this file to a service

const default_base_grid_options: NgGridStackOptions = {
  cellHeight: 75,
  margin: 5,
  minRow: 1, // don't collapse when empty
  disableOneColumnMode: false,
  float: true
};

const static_base_grid_options: NgGridStackOptions = {
  acceptWidgets: false,
  staticGrid: true,
  ...default_base_grid_options
}

const static_sub_grid_options : NgGridStackOptions = { // sub grid options
  column: 'auto',
  ...static_base_grid_options
};

const static_top_grid_options : NgGridStackOptions = { // main grid options
  column: 6,
  subGridOpts: static_sub_grid_options,
  ...static_base_grid_options
};

function gridHeight(grid: GridStack) {
  let height = 0;
  for(let child of grid.engine.nodes) {
    let childY = child.y ? child.y : 0;
    let childH = child.h ? child.h : 0;
    let childMaxY = childY + childH;
    if(childMaxY > height) {
      height = childMaxY;
    }
  }
  return height;
}

export {
  default_base_grid_options,
  static_sub_grid_options,
  static_top_grid_options,
  gridHeight
}
