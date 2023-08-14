import { DataTransformer, Plugin } from "src/plugins/interfaces";


export class ChemistryPlugin extends Plugin implements DataTransformer {
  transformData(str: string|undefined|null) {
    return applyChemistryFormatting('^', '_', str);
  }

  static override instanceOfDataTransformer(): boolean {
    return true;
  }
}

function applyChemistryFormatting(superscript_delimiter: string, subscript_delimiter: string, str: string|undefined|null) {

  if(!str) {
    throw 'cannot apply chemistry formatting to null/undefined object';
  }

  var sub_del = escapeRegex(subscript_delimiter);
  var sup_del = escapeRegex(superscript_delimiter);

  // replace subscript_delimiterSTRINGsubscript_delimiter in the string with <sub>STRING</sub>
  var sub_regexp = new RegExp(sub_del + "([^" + sub_del + "]+)" + sub_del, 'g');
  str = str.replace(sub_regexp, "<sub>$1</sub>");

  // replace superscript_delimiterSTRINGsuperscript_delimiter in the string with <sup>STRING</sup>
  var super_regexp = new RegExp(sup_del + "([^" + sup_del + "]+)" + sup_del, 'g');
  str = str.replace(super_regexp, "<sup>$1</sup>");

  // replace [box] in the string with a box
  str = str.replaceAll("[box]", '<span style="border: 1px solid #333; font-size:7px;">&nbsp;&nbsp;&nbsp;</span>');
  // str = str.replace(/\[box\]/g, '<span style="border: 1px solid #333; font-size:7px;">&nbsp;&nbsp;&nbsp;</span>');

  return str;
}

function escapeRegex(string: string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
