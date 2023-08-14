import { DataValidator, HasOptions, Plugin } from "src/plugins/interfaces";

export enum TemperatureUnits {
  fahrenheit = "fahrenheit",
  celsius = "celsius",
  kelvin = "kelvin"
}

export class TemperaturePlugin extends Plugin implements DataValidator {

  constructor(private options: any) {
    super();
    if(!options || !("unit" in options)) {
      throw ("Temperature units must be provided for the temperature plugin to work")
    }
    if(!(options.unit in TemperatureUnits)) {
      throw ("Temperature units must be Fahrenheit, Celcius or Kelvin")
    }
  }

  validateData(input: string|undefined|null) {
    const temperature_units = this.options.unit;
    if(!input) {
      return "Temperature input empty"
    }
    let number: number = Number(input);
    if(isNaN(number)) {
      return "Input must be a number";
    }
    if(temperature_units == TemperatureUnits.fahrenheit) {
      return validateFahrenheit(number);
    }
    if(temperature_units == TemperatureUnits.celsius) {
      return validateCelsius(number);
    }
    if(temperature_units == TemperatureUnits.kelvin) {
      return validateKelvin(number);
    }
    throw "Should never reach this point";
  }

  static availableOptions() {
    return {
      unit: Object.values(TemperatureUnits)
    }
  }

  static override instanceOfDataValidator(): boolean {
    return true;
  }

  override instanceOfDataValidator(): boolean {
    return true;
  }

  static override instanceOfHasOptions(): boolean {
    return true;
  }
}

function validateFahrenheit(number: number) {
  const min_fahrenheit = -459.67;
  if(number < min_fahrenheit) {
    return "Minimum temperature in Fahrenheit is -459.67";
  }
  return undefined;
}

function validateCelsius(number: number) {
  const min_celsius = -273.15;
  if(number < min_celsius) {
    return "Minimum temperature in Celsius is -273.15";
  }
  return undefined;
}

function validateKelvin(number: number) {
  const min_kelvin = 0;
  if(number < min_kelvin) {
    return "Minimum temperature in Kelvin is 0";
  }
  return undefined;
}
