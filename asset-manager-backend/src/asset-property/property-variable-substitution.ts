import { AssetPropertyType } from './asset-property-definition.entity';
import { UnitedPropertyDto } from './dto/UnitedPropertyDto';

// Only perform up to a max. number of replacement cycles to prevent
// an endless loop
const UPDATE_LIMIT = 21;

interface SubstitutionResult {
  valueSubstituted: string;
  substitutionCount: number;
}

/**
 * Applies variable substitution for a variable's value: inside the `value` field
 * of a property the notation `${...}` can be used to insert a value of another
 * property. This function takes such a value string and the list of all properties
 * and replaces the references. This function is recursion-safe and detects
 * loops in the variable replacement graph. Furthermore it is string safe and
 * can deal with not defined variables. The key of a `UnitedPropertyDto` is used
 * as variable name
 *
 * @param value The value of a variable to replace all `${...}` notations
 * @param all The list of all available variables
 * @param visited The list of variable keys which are already visited
 * @returns The result of the substitution
 */
function substituteVariableForProp(
  value: string,
  all: UnitedPropertyDto[],
  visited: string[],
): SubstitutionResult {
  // Check if ther is any substitution required
  if (!value || value.indexOf('${') < 0) {
    return {
      substitutionCount: 0,
      valueSubstituted: value,
    };
  }

  // Go through the string and perform the replacement
  let substitutionCount = 0;
  let pos = 0;
  while (pos < value.length) {
    // Find the variable replacement start string
    const startPos = value.indexOf('${', pos);

    // Not found: no variables uses in this string, break
    if (startPos < 0) {
      break;
    }

    // If there is no ending bracket, return, otherwise we would endup
    // in a loop
    const endPos = value.indexOf('}', startPos);
    if (endPos < 0) {
      return {
        substitutionCount,
        valueSubstituted: value,
      };
    }

    // Extract variable name
    const varname = value.substring(startPos + 2, endPos);

    let replStr = '[Error: recursion in variables]';
    // Check that the variable has not been replaced yet, otherwise
    // this is a loop and we don't want that
    if (visited.indexOf(varname) < 0) {
      const obj = all.find(prop => prop.key === varname);
      if (obj) {
        replStr = (obj.value as string) || '';
      } else {
        replStr = `[Error: no such variable '${varname}']`;
      }
    }

    value = `${value.substring(0, startPos)}${replStr}${value.substring(endPos + 1)}`;
    substitutionCount++;
    visited.push(varname);
    pos = endPos + 1;
  }

  // Apply the function once more but with a list of already visted nodes
  // (kind of breadth-first search)
  const valueTmp = substituteVariableForProp(value, all, visited);

  return {
    substitutionCount: substitutionCount + valueTmp.substitutionCount,
    valueSubstituted: valueTmp.valueSubstituted,
  };
}

export function performVariableSubstitution(props: UnitedPropertyDto[]): UnitedPropertyDto[] {
  // Rathern than doing a topological order algorithm, we use the
  // approach of bubble-sort which repeats as long as changes occur
  // if it is stable (= no changes) we are finished
  const updatedProps: UnitedPropertyDto[] = props;
  let substitutions,
    i = 0;
  do {
    substitutions = 0;
    i++;
    // Collect all replacements on this map, before applying
    // them. This makes handling of recursion in the variables
    // easier since the replaced date is not dependent on the
    // order of properties
    const replacements: { [key: string]: string } = {};

    // Iterate through all props and perform the variable substitution
    // (if any)
    for (const prop of props) {
      // Only properties of type "string" and with a non-null value
      // are candidates for variable replacements
      if (prop.value && prop.type === AssetPropertyType.STRING) {
        const tmp = substituteVariableForProp(prop.value as string, updatedProps, [prop.key]);

        substitutions += tmp.substitutionCount;
        replacements[prop.key] = tmp.valueSubstituted;
      }
    }

    // Apply all "staged" replacements now at once
    for (const key in replacements) {
      const prop = updatedProps.find(p => p.key === key);
      if (prop) {
        prop.renderedValue = replacements[key];
      }
    }
  } while (substitutions > 0 && i < UPDATE_LIMIT);

  // Return the result
  return updatedProps;
}
