module.exports = function(str) {
  return applyChemistryFormatting('^', '_', str);
}

function applyChemistryFormatting(superscript_delimiter, subscript_delimiter, str) {

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

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
