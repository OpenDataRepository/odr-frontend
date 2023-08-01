var Plotly = require('plotly.js-dist');
var Papa = require('papaparse');

export function graphCsvBlob(html_element: any, csvBlob: Blob, file_name?: string) {
  convertCsvBlobToString(csvBlob).then((csvString) => {
    Papa.parse(csvString, {complete: (results: any) => {
      graph(html_element, results.data, file_name);
    }})
  })
}

function graphCsvFile(html_element: any, data_file_path: string) {
  // const file = new File([fs.readFileSync(data_file_path)], data_file_path.split('/').pop());
  Papa.parse(data_file_path, {download: true, complete: (results: any) => {
    graph(html_element, results.data, data_file_path.split('/').pop());
  }});
}

function graph(html_element: any, input_data: any, title?: string) {
  let x_axis_name = input_data[0][0];
  let y_axis_name = input_data[0][1];
  input_data.shift();
  let transposed_data = transposeArray(input_data);
  const data = [
    {
      x: transposed_data[0],
      y: transposed_data[1]
    }
  ]
  const layout = {
    title,
    xaxis: {
      title: x_axis_name
    },
    yaxis: {
      title: y_axis_name
    }
  };
  Plotly.newPlot(html_element, data, layout);
}

function transposeArray(array: any[]) {
  // Get number of rows and columns
  const rows = array.length;
  const cols = array[0].length;

  // Create a new array with dimensions swapped
  const transposedArray = new Array(cols);
  for (let i = 0; i < cols; i++) {
    transposedArray[i] = new Array(rows);
  }

  // Copy values from original array into transposed array
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposedArray[j][i] = array[i][j];
    }
  }

  return transposedArray;
}

function convertCsvBlobToString(csvBlob: Blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const csvString = fileReader.result;
      resolve(csvString);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };

    fileReader.readAsText(csvBlob, 'utf-8');
  });
}
