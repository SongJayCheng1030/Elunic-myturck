import {
  AssetPropertyDefinitionEntity,
  AssetPropertyType,
} from './asset-property-definition.entity';
import { AssetPropertyValueEntity } from './asset-property-value.entity';
import { UnitedPropertyDto } from './dto/UnitedPropertyDto';
import { performVariableSubstitution } from './property-variable-substitution';

interface FlatPropertyKeyValueList {
  [key: string]: string;
}

function transformFromFlat(kvMap: FlatPropertyKeyValueList): UnitedPropertyDto[] {
  const all: UnitedPropertyDto[] = [];

  for (const key in kvMap) {
    const ent = new AssetPropertyDefinitionEntity();
    ent.key = key;
    ent.name = { de_DE: key };
    ent.type = AssetPropertyType.STRING;
    ent.createdAt = new Date();
    ent.updatedAt = new Date();

    const entVal = new AssetPropertyValueEntity();
    entVal.value = kvMap[key];

    ent.values = [entVal];
    all.push(new UnitedPropertyDto(ent, ''));
  }

  return all;
}

function transformToFlat(props: UnitedPropertyDto[]): FlatPropertyKeyValueList {
  const tb: FlatPropertyKeyValueList = {};
  props.forEach(prop => {
    // @ts-ignore
    tb[prop.key] = prop.value;
  });
  return tb;
}

// Main testcases
// ---

describe('Property variable substitution helper', () => {
  it('should not change variables without substitutions', () => {
    const input = {
      PROP_1: 'Hello World!',
      PROP_2: 'Another property',
    };

    const output = transformToFlat(performVariableSubstitution(transformFromFlat(input)));

    expect(output).toStrictEqual(input);
  });

  it('should replace normal constellations of substitutions', () => {
    const input = {
      PROP_3: 'In fair Verona',
      PROP_1: 'Two households, ${PROP_2}',
      PROP_2: 'both alike in dignity, ${PROP_3}',
    };

    const output = transformToFlat(performVariableSubstitution(transformFromFlat(input)));

    expect(output).toStrictEqual({
      PROP_3: 'In fair Verona',
      PROP_1: 'Two households, both alike in dignity, In fair Verona',
      PROP_2: 'both alike in dignity, In fair Verona',
    });
  });

  it('should handle variable recursion without an endless loop', () => {
    const input = {
      PROP_I: 'ABC: ${PROP_J}',
      PROP_J: 'DEF: ${PROP_I}',
    };

    const output = transformToFlat(performVariableSubstitution(transformFromFlat(input)));

    expect(output).toStrictEqual({
      PROP_J: 'DEF: ABC: [Error: recursion in variables]',
      PROP_I: 'ABC: DEF: [Error: recursion in variables]',
    });
  });

  it('should handle variable recursion without an endless loop and it should be position invariant', () => {
    let input = {
      PROP_I: 'ABC: ${PROP_J}',
      PROP_J: 'DEF: ${PROP_I}',
    };

    let output = transformToFlat(performVariableSubstitution(transformFromFlat(input)));

    expect(output).toStrictEqual({
      PROP_J: 'DEF: ABC: [Error: recursion in variables]',
      PROP_I: 'ABC: DEF: [Error: recursion in variables]',
    });

    input = {
      PROP_J: 'DEF: ${PROP_I}',
      PROP_I: 'ABC: ${PROP_J}',
    };

    output = transformToFlat(performVariableSubstitution(transformFromFlat(input)));

    expect(output).toStrictEqual({
      PROP_I: 'ABC: DEF: [Error: recursion in variables]',
      PROP_J: 'DEF: ABC: [Error: recursion in variables]',
    });
  });

  it('should ignore broken substitutions', () => {
    const input = {
      PROP_1: 'The other variable',
      PROP_2: 'No, that is invalid ${PROP_1} ${PROP_NOT_EXISTING last',
    };

    const output = transformToFlat(performVariableSubstitution(transformFromFlat(input)));

    expect(output).toStrictEqual({
      PROP_1: 'The other variable',
      PROP_2: 'No, that is invalid The other variable ${PROP_NOT_EXISTING last',
    });
  });

  it('should handle non-existing variables', () => {
    const input = {
      PROP_1: 'This does not exist: ${NO_PROP}',
    };

    const output = transformToFlat(performVariableSubstitution(transformFromFlat(input)));

    expect(output).toStrictEqual({
      PROP_1: `This does not exist: [Error: no such variable 'NO_PROP']`,
    });
  });
});
