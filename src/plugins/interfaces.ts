export interface DataTransformer {
  transformData: (data:any) => any;
}

export interface DataValidator {
  validateData: (data:any, options?: any) => string|undefined;
}

export interface HasOptions {
  availableOptions: () => Record<string, string[]>
}

export class Plugin {

  static instanceOfDataTransformer(): boolean {
    return false;
  }

  static instanceOfDataValidator(): boolean {
    return false;
  }

  static instanceOfHasOptions(): boolean {
    return false;
  }

  instanceOfDataValidator(): boolean {
    return false;
  }

}
