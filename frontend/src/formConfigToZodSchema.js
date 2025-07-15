import { z } from 'zod';

const formatErrorMessage = (message, params = {}) => {
  if (typeof message !== 'string') {
    return "An unknown validation error occurred.";
  }
  let formatted = message;
  for (const key in params) {
    if (key === 'fields' && Array.isArray(params[key])) {
      formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key].join(', '));
    } else if (key === 'minDate' || key === 'maxDate') {
      if (params['isFieldReference'] && params['days'] !== undefined && params['days'] !== 0) {
        formatted = formatted.replace(
          new RegExp(`\\{${key}\\}`, 'g'),
          `${params['name']} ${params['sign']} ${params['days']} jours`
        );
      } else if (params['isFieldReference']) {
        formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), params['name']);
      } else {
        formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
      }
    } else {
      formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
    }
  }
  return formatted;
};

// Fonction pour valider la clé de contrôle mod97
const validateMod97 = (value, base, position) => {
  console.log('validateMod97 called with:', { value, base, position });
  const baseValue = value.slice(base[0], base[1]);
  const keyValue = value.slice(position[0], position[1]);
  console.log('baseValue:', baseValue, 'keyValue:', keyValue);
  if (!/^\d+$/.test(baseValue) || !/^\d+$/.test(keyValue)) {
    console.log('Validation failed: baseValue or keyValue contains non-digits');
    return false;
  }
  const number = parseInt(baseValue, 10);
  const expectedKey = 97 - (number % 97);
  const actualKey = parseInt(keyValue, 10);
  console.log('number:', number, 'expectedKey:', expectedKey, 'actualKey:', actualKey);
  const isValid = expectedKey === actualKey;
  console.log('mod97 validation result:', isValid);
  return isValid;
};

// Valider la configuration de génération
const validateGenerateConfig = (generate, fieldNames, fieldName) => {
  console.log(`Validating generate config for field ${fieldName}:`, generate);
  if (!Array.isArray(generate)) {
    console.warn(`Invalid generate config for field '${fieldName}': must be an array.`);
    return false;
  }
  return generate.every((part, index) => {
    if (typeof part === 'string') {
      console.log(`Part ${index} is static:`, part);
      return true; // Chaîne statique, toujours valide
    }
    if (typeof part === 'object' && part.field) {
      console.log(`Part ${index} is dynamic:`, part);
      if (!part.field.startsWith('#')) {
        console.warn(`Invalid field reference in generate config for field '${fieldName}', part ${index}: must start with '#'.`);
        return false;
      }
      const refField = part.field.substring(1);
      if (!fieldNames.includes(refField)) {
        console.warn(`Invalid field reference in generate config for field '${fieldName}', part ${index}: '${refField}' does not exist.`);
        return false;
      }
      if (part.slice) {
        if (!Array.isArray(part.slice) || part.slice.length !== 2 || !Number.isInteger(part.slice[0]) || !Number.isInteger(part.slice[1])) {
          console.warn(`Invalid slice in generate config for field '${fieldName}', part ${index}: must be an array of two integers.`);
          return false;
        }
        if (part.slice[0] < 0 || part.slice[1] < part.slice[0]) {
          console.warn(`Invalid slice indices in generate config for field '${fieldName}', part ${index}: indices must be non-negative and end >= start.`);
          return false;
        }
      }
      return true;
    }
    console.warn(`Invalid part in generate config for field '${fieldName}', part ${index}: must be a string or an object with 'field'.`);
    return false;
  });
};

export const formConfigToZodSchema = (config) => {
  const schemaFields = {};
  const globalMessages = {
    "required": "Ce champ est obligatoire.",
    "minLength": "Minimum {min} caractères requis.",
    "maxLength": "Maximum {max} caractères autorisés.",
    "length": "Doit contenir exactement {len} caractères.",
    "pattern": "Format invalide.",
    "email": "Adresse email invalide.",
    "url": "URL invalide.",
    "min": "La valeur minimale est {min}.",
    "max": "La valeur maximale est {max}.",
    "lessThan": "Doit être inférieur à {value}.",
    "moreThan": "Doit être supérieur à {value}.",
    "integer": "Doit être un nombre entier.",
    "minDate": "La date doit être postérieure ou égale à {minDate}.",
    "maxDate": "La date doit être antérieure ou égale à {maxDate}.",
    "minArray": "Minimum {min} éléments requis.",
    "maxArray": "Maximum {max} éléments autorisés.",
    "lengthArray": "Doit contenir exactement {len} éléments.",
    "enum": "Doit être l'une des valeurs suivantes : {values}.",
    "notEnum": "Ne doit pas être l'une des valeurs suivantes : {values}.",
    "trim": "Ne peut pas commencer ou se terminer par des espaces.",
    "lowercase": "Doit être en minuscules.",
    "uppercase": "Doit être en majuscules.",
    "equals": "Doit être égal aux champs {fields}.",
    "notEquals": "Ne peut pas être égal aux champs {fields}.",
    "generate": "La valeur générée est invalide."
  };

  const interFieldComparisonRules = [];
  const interFieldNotEqualsRules = [];
  const interFieldDateRules = [];

  // Vérifier les champs existants pour valider les références
  const fieldNames = config.fields.map(field => field.name);
  const dateFieldNames = config.fields.filter(field => field.type === 'date').map(field => field.name);

  // Regex pour parser les expressions comme "#fieldName + 90" ou "today - 26"
  const dateExpressionRegex = /^(#?\w+)\s*([+-])\s*(\d+)$/;

  config.fields.forEach((fieldConfig) => {
    const { name, type, validations = {}, generate } = fieldConfig;
    const fieldErrorMessages = { ...globalMessages, ...(validations.errorMessage || {}) };
    let currentFieldSchema;

    // Si le champ est généré automatiquement
    if (generate) {
      console.log(`Processing generated field: ${name}`);
      if (!validateGenerateConfig(generate, fieldNames, name)) {
        console.warn(`Skipping invalid generate config for field '${name}'.`);
        currentFieldSchema = z.string().optional();
      } else {
        // Initialiser comme string, pas optionnel par défaut
        currentFieldSchema = z.string();
        // Appliquer les validations supplémentaires
        if (type === 'string') {
          if (validations.minLength !== undefined) {
            currentFieldSchema = currentFieldSchema.min(validations.minLength, { message: formatErrorMessage(fieldErrorMessages.minLength, { min: validations.minLength }) });
          }
          if (validations.maxLength !== undefined) {
            currentFieldSchema = currentFieldSchema.max(validations.maxLength, { message: formatErrorMessage(fieldErrorMessages.maxLength, { max: validations.maxLength }) });
          }
          if (validations.length !== undefined) {
            currentFieldSchema = currentFieldSchema.length(validations.length, { message: formatErrorMessage(fieldErrorMessages.length, { len: validations.length }) });
          }
          if (validations.pattern) {
            currentFieldSchema = currentFieldSchema.regex(new RegExp(validations.pattern), { message: formatErrorMessage(fieldErrorMessages.pattern) });
          }
        }
        if (validations.required) {
          currentFieldSchema = currentFieldSchema
            .nullable()
            .refine(
              val => val !== null && val !== '',
              { message: fieldErrorMessages.required || globalMessages.required }
            );
        } else {
          currentFieldSchema = currentFieldSchema.nullable().optional();
        }
      }
    } else {
      switch (type) {
        case 'string':
          currentFieldSchema = z.string();
          break;
        case 'number':
          currentFieldSchema = z.coerce.number();
          break;
        case 'boolean':
          currentFieldSchema = z.coerce.boolean();
          break;
        case 'date':
          currentFieldSchema = z.string();
          break;
        case 'array':
          currentFieldSchema = z.array(z.string());
          break;
        default:
          currentFieldSchema = z.any();
          break;
      }

      if (type === 'string') {
        if (validations.minLength !== undefined) {
          currentFieldSchema = currentFieldSchema.min(validations.minLength, { message: formatErrorMessage(fieldErrorMessages.minLength, { min: validations.minLength }) });
        }
        if (validations.maxLength !== undefined) {
          currentFieldSchema = currentFieldSchema.max(validations.maxLength, { message: formatErrorMessage(fieldErrorMessages.maxLength, { max: validations.maxLength }) });
        }
        if (validations.length !== undefined) {
          currentFieldSchema = currentFieldSchema.length(validations.length, { message: formatErrorMessage(fieldErrorMessages.length, { len: validations.length }) });
        }
        if (validations.pattern) {
          currentFieldSchema = currentFieldSchema.regex(new RegExp(validations.pattern), { message: formatErrorMessage(fieldErrorMessages.pattern) });
        }
        if (validations.format) {
          switch (validations.format) {
            case 'email':
              currentFieldSchema = currentFieldSchema.email({ message: fieldErrorMessages.email });
              break;
            case 'url':
              currentFieldSchema = currentFieldSchema.url({ message: fieldErrorMessages.url });
              break;
            default:
              console.warn(`Unsupported format "${validations.format}" for field "${name}".`);
              break;
          }
        }
        if (validations.lowercase) {
          currentFieldSchema = currentFieldSchema.refine(val => val === val.toLowerCase(), { message: fieldErrorMessages.lowercase });
        }
        if (validations.uppercase) {
          currentFieldSchema = currentFieldSchema.refine(val => val === val.toUpperCase(), { message: fieldErrorMessages.uppercase });
        }
        if (validations.trim) {
          currentFieldSchema = currentFieldSchema.transform(val => typeof val === 'string' ? val.trim() : val)
            .refine(val => typeof val !== 'string' || val === val.trim(), { message: fieldErrorMessages.trim });
        }
        if (validations.enum) {
          currentFieldSchema = currentFieldSchema.refine(val => validations.enum.includes(val), { message: formatErrorMessage(fieldErrorMessages.enum, { values: validations.enum.join(', ') }) });
        }
        if (validations.notEnum) {
          currentFieldSchema = currentFieldSchema.refine(val => !validations.notEnum.includes(val), { message: formatErrorMessage(fieldErrorMessages.notEnum, { values: validations.notEnum.join(', ') }) });
        }
        if (validations.segments && Array.isArray(validations.segments)) {
          validations.segments.forEach((segment, index) => {
            if (segment.pattern && segment.position && Array.isArray(segment.position) && segment.position.length === 2) {
              currentFieldSchema = currentFieldSchema.refine(
                (val) => {
                  console.log(`Validating segment ${index} for field ${name}:`, { val, position: segment.position, pattern: segment.pattern });
                  if (typeof val !== 'string') {
                    console.log('Validation failed: value is not a string');
                    return false;
                  }
                  const segmentValue = val.slice(segment.position[0], segment.position[1]);
                  const isValid = new RegExp(segment.pattern).test(segmentValue);
                  console.log(`Segment ${index} value: ${segmentValue}, isValid: ${isValid}`);
                  return isValid;
                },
                {
                  message: formatErrorMessage(
                    validations.errorMessage?.segments || fieldErrorMessages.pattern
                  ),
                  path: [name]
                }
              );
            }
            if (segment.check && segment.check.type === 'mod97' && segment.check.base && Array.isArray(segment.check.base) && segment.check.base.length === 2) {
              currentFieldSchema = currentFieldSchema.refine(
                (val) => {
                  console.log(`Validating mod97 check for field ${name}:`, { val, base: segment.check.base, position: segment.position });
                  if (typeof val !== 'string') {
                    console.log('Validation failed: value is not a string');
                    return false;
                  }
                  const isValid = validateMod97(val, segment.check.base, segment.position);
                  console.log(`mod97 check result: ${isValid}`);
                  return isValid;
                },
                {
                  message: formatErrorMessage(
                    validations.errorMessage?.segments || fieldErrorMessages.pattern
                  ),
                  path: [name]
                }
              );
            }
          });
        }
      }

      if (type === 'number') {
        if (validations.min !== undefined) {
          currentFieldSchema = currentFieldSchema.min(validations.min, { message: formatErrorMessage(fieldErrorMessages.min, { min: validations.min }) });
        }
        if (validations.max !== undefined) {
          currentFieldSchema = currentFieldSchema.max(validations.max, { message: formatErrorMessage(fieldErrorMessages.max, { max: validations.max }) });
        }
        if (validations.lessThan !== undefined) {
          currentFieldSchema = currentFieldSchema.lt(validations.lessThan, { message: formatErrorMessage(fieldErrorMessages.lessThan, { value: validations.lessThan }) });
        }
        if (validations.moreThan !== undefined) {
          currentFieldSchema = currentFieldSchema.gt(validations.moreThan, { message: formatErrorMessage(fieldErrorMessages.moreThan, { value: validations.moreThan }) });
        }
        if (validations.integer) {
          currentFieldSchema = currentFieldSchema.int({ message: fieldErrorMessages.integer });
        }
        if (validations.enum) {
          currentFieldSchema = currentFieldSchema.refine(val => validations.enum.includes(val), { message: formatErrorMessage(fieldErrorMessages.enum, { values: validations.enum.join(', ') }) });
        }
        if (validations.notEnum) {
          currentFieldSchema = currentFieldSchema.refine(val => !validations.notEnum.includes(val), { message: formatErrorMessage(fieldErrorMessages.notEnum, { values: validations.notEnum.join(', ') }) });
        }
        if (validations.round) {
          currentFieldSchema = currentFieldSchema.transform(val => {
            if (typeof val === 'number' && !isNaN(val)) {
              return Math.round(val);
            }
            return val;
          });
        }
      }

      if (type === 'date') {
        currentFieldSchema = currentFieldSchema.regex(/^\d{4}-\d{2}-\d{2}$/, { message: fieldErrorMessages.pattern });
        if (validations.minDate) {
          const minDateValue = validations.minDate;
          const match = minDateValue.match(dateExpressionRegex);
          if (match) {
            const [, ref, sign, daysStr] = match;
            const days = parseInt(daysStr, 10);
            if (ref === 'today' || (ref.startsWith('#') && fieldNames.includes(ref.substring(1)) && dateFieldNames.includes(ref.substring(1)))) {
              const compareFieldName = ref === 'today' ? 'today' : ref.substring(1);
              interFieldDateRules.push({
                fieldName: name,
                compareField: compareFieldName,
                type: 'minDate',
                days: sign === '+' ? days : -days,
                sign: sign,
                errorMessage: formatErrorMessage(fieldErrorMessages.minDate, {
                  minDate: `${compareFieldName} ${sign} ${days} jours`,
                  name: compareFieldName,
                  days,
                  sign,
                  isFieldReference: true
                })
              });
            } else {
              console.warn(`Validation 'minDate' for field '${name}' references invalid or non-date field '${ref}'.`);
            }
          } else if (typeof minDateValue === 'string' && minDateValue.startsWith('#')) {
            const compareFieldName = minDateValue.substring(1);
            if (fieldNames.includes(compareFieldName) && dateFieldNames.includes(compareFieldName)) {
              interFieldDateRules.push({
                fieldName: name,
                compareField: compareFieldName,
                type: 'minDate',
                days: 0,
                sign: '+',
                errorMessage: formatErrorMessage(fieldErrorMessages.minDate, {
                  minDate: compareFieldName,
                  name: compareFieldName,
                  isFieldReference: true
                })
              });
            } else {
              console.warn(`Validation 'minDate' for field '${name}' references invalid or non-date field '${compareFieldName}'.`);
            }
          } else if (minDateValue === 'today') {
            interFieldDateRules.push({
              fieldName: name,
              compareField: 'today',
              type: 'minDate',
              days: 0,
              sign: '+',
              errorMessage: formatErrorMessage(fieldErrorMessages.minDate, {
                minDate: 'today',
                name: 'today',
                isFieldReference: true
              })
            });
          } else {
            currentFieldSchema = currentFieldSchema.refine((val) => {
              const date = new Date(val);
              const minDate = new Date(minDateValue);
              return !isNaN(date.getTime()) && !isNaN(minDate.getTime()) && date >= minDate;
            }, {
              message: formatErrorMessage(fieldErrorMessages.minDate, { minDate: minDateValue })
            });
          }
        }
        if (validations.maxDate) {
          const maxDateValue = validations.maxDate;
          const match = maxDateValue.match(dateExpressionRegex);
          if (match) {
            const [, ref, sign, daysStr] = match;
            const days = parseInt(daysStr, 10);
            if (ref === 'today' || (ref.startsWith('#') && fieldNames.includes(ref.substring(1)) && dateFieldNames.includes(ref.substring(1)))) {
              const compareFieldName = ref === 'today' ? 'today' : ref.substring(1);
              interFieldDateRules.push({
                fieldName: name,
                compareField: compareFieldName,
                type: 'maxDate',
                days: sign === '+' ? days : -days,
                sign: sign,
                errorMessage: formatErrorMessage(fieldErrorMessages.maxDate, {
                  maxDate: `${compareFieldName} ${sign} ${days} jours`,
                  name: compareFieldName,
                  days,
                  sign,
                  isFieldReference: true,
                })
              });
            } else {
              console.warn(`Validation 'maxDate' for field '${name}' references invalid or non-date field '${ref}'.`);
            }
          } else if (typeof maxDateValue === 'string' && maxDateValue.startsWith('#')) {
            const compareFieldName = maxDateValue.substring(1);
            if (fieldNames.includes(compareFieldName) && dateFieldNames.includes(compareFieldName)) {
              interFieldDateRules.push({
                fieldName: name,
                compareField: compareFieldName,
                type: 'maxDate',
                days: 0,
                sign: '+',
                errorMessage: formatErrorMessage(fieldErrorMessages.maxDate, {
                  maxDate: compareFieldName,
                  name: compareFieldName,
                  isFieldReference: true
                })
              });
            } else {
              console.warn(`Validation 'maxDate' for field '${name}' references invalid or non-date field '${compareFieldName}'.`);
            }
          } else if (maxDateValue === 'today') {
            interFieldDateRules.push({
              fieldName: name,
              compareField: 'today',
              type: 'maxDate',
              days: 0,
              sign: '+',
              errorMessage: formatErrorMessage(fieldErrorMessages.maxDate, {
                maxDate: 'today',
                name: 'today',
                isFieldReference: true
              })
            });
          } else {
            currentFieldSchema = currentFieldSchema.refine((val) => {
              const date = new Date(val);
              const maxDate = new Date(maxDateValue);
              return !isNaN(date.getTime()) && !isNaN(maxDate.getTime()) && date <= maxDate;
            }, {
              message: formatErrorMessage(fieldErrorMessages.maxDate, { maxDate: maxDateValue })
            });
          }
        }
        if (validations.maxToday) {
          interFieldDateRules.push({
            fieldName: name,
            compareField: 'today',
            type: 'maxDate',
            days: 0,
            sign: '+',
            errorMessage: formatErrorMessage(fieldErrorMessages.maxDate, {
              maxDate: 'today',
              name: 'today',
              isFieldReference: true
            })
          });
        }
      }

      if (type === 'array') {
        if (validations.lengthArray !== undefined) {
          currentFieldSchema = currentFieldSchema.length(validations.lengthArray, { message: formatErrorMessage(fieldErrorMessages.lengthArray, { len: validations.lengthArray }) });
        }
        if (validations.minArray !== undefined) {
          currentFieldSchema = currentFieldSchema.min(validations.minArray, { message: formatErrorMessage(fieldErrorMessages.minArray, { min: validations.minArray }) });
        }
        if (validations.maxArray !== undefined) {
          currentFieldSchema = currentFieldSchema.max(validations.maxArray, { message: formatErrorMessage(fieldErrorMessages.maxArray, { max: validations.maxArray }) });
        }
        if (validations.enum) {
          currentFieldSchema = currentFieldSchema.refine(arr => Array.isArray(arr) && arr.every(item => validations.enum.includes(item)), { message: formatErrorMessage(fieldErrorMessages.enum, { values: validations.enum.join(', ') }) });
        }
        if (validations.notEnum) {
          currentFieldSchema = currentFieldSchema.refine(arr => Array.isArray(arr) && arr.every(item => !validations.notEnum.includes(item)), { message: formatErrorMessage(fieldErrorMessages.notEnum, { values: validations.notEnum.join(', ') }) });
        }
      }

      if (validations.required) {
        currentFieldSchema = currentFieldSchema
          .nullable()
          .refine(
            val => val !== null,
            { message: fieldErrorMessages.required || globalMessages.required }
          );
      } else {
        currentFieldSchema = currentFieldSchema.nullable().optional();
      }

      if (validations.equals !== undefined) {
        const equalsValue = validations.equals;
        if (typeof equalsValue === 'string' && equalsValue.startsWith('#')) {
          const compareFieldName = equalsValue.substring(1);
          interFieldComparisonRules.push({
            fieldName: name,
            compareFields: [compareFieldName],
            errorMessage: formatErrorMessage(fieldErrorMessages.equals, { fields: [compareFieldName] })
          });
        } else if (Array.isArray(equalsValue) && equalsValue.every(val => typeof val === 'string' && val.startsWith('#'))) {
          const compareFieldNames = equalsValue.map(val => val.substring(1));
          interFieldComparisonRules.push({
            fieldName: name,
            compareFields: compareFieldNames,
            errorMessage: formatErrorMessage(fieldErrorMessages.equals, { fields: compareFieldNames })
          });
        } else {
          console.warn(`Validation 'equals' for field '${name}' must be a string starting with '#' or an array of such strings.`);
        }
      }

      if (validations.notEquals !== undefined) {
        const notEqualsValue = validations.notEquals;
        if (typeof notEqualsValue === 'string' && notEqualsValue.startsWith('#')) {
          const compareFieldName = notEqualsValue.substring(1);
          interFieldNotEqualsRules.push({
            fieldName: name,
            compareFields: [compareFieldName],
            errorMessage: formatErrorMessage(fieldErrorMessages.notEquals, { fields: [compareFieldName] })
          });
        } else if (Array.isArray(notEqualsValue) && notEqualsValue.every(val => typeof val === 'string' && val.startsWith('#'))) {
          const compareFieldNames = notEqualsValue.map(val => val.substring(1));
          interFieldNotEqualsRules.push({
            fieldName: name,
            compareFields: compareFieldNames,
            errorMessage: formatErrorMessage(fieldErrorMessages.notEquals, { fields: compareFieldNames })
          });
        } else {
          console.warn(`Validation 'notEquals' for field '${name}' must be a string starting with '#' or an array of such strings.`);
        }
      }
    }

    schemaFields[name] = currentFieldSchema;
  });

  let finalSchema = z.object(schemaFields);

  interFieldComparisonRules.forEach((rule) => {
    finalSchema = finalSchema.refine((data) => {
      const fieldToValidate = data[rule.fieldName];
      if (fieldToValidate === null || fieldToValidate === undefined) {
        return true;
      }
      return rule.compareFields.every(compareField => data[compareField] === fieldToValidate);
    }, {
      message: rule.errorMessage,
      path: [rule.fieldName]
    });
  });

  interFieldNotEqualsRules.forEach((rule) => {
    finalSchema = finalSchema.refine((data) => {
      const fieldToValidate = data[rule.fieldName];
      if (fieldToValidate === null || fieldToValidate === undefined) {
        return true;
      }
      return rule.compareFields.every(compareField => data[compareField] !== fieldToValidate);
    }, {
      message: rule.errorMessage,
      path: [rule.fieldName]
    });
  });

  interFieldDateRules.forEach((rule) => {
    finalSchema = finalSchema.refine((data) => {
      const fieldToValidate = data[rule.fieldName];
      if (fieldToValidate === null || fieldToValidate === undefined) {
        return true;
      }
      const dateToValidate = new Date(fieldToValidate);
      dateToValidate.setHours(0, 0, 0, 0);
      if (isNaN(dateToValidate.getTime())) {
        return true;
      }
      let compareDate;
      if (rule.compareField === 'today') {
        compareDate = new Date();
        compareDate.setHours(0, 0, 0, 0);
      } else {
        const compareFieldValue = data[rule.compareField];
        if (compareFieldValue === null || compareFieldValue === undefined) {
          return true;
        }
        compareDate = new Date(compareFieldValue);
        compareDate.setHours(0, 0, 0, 0);
        if (isNaN(compareDate.getTime())) {
          return true;
        }
      }
      if (rule.days !== 0) {
        compareDate.setDate(compareDate.getDate() + rule.days);
      }
      if (rule.type === 'minDate') {
        return dateToValidate >= compareDate;
      } else if (rule.type === 'maxDate') {
        return dateToValidate <= compareDate;
      }
      return true;
    }, {
      message: rule.errorMessage,
      path: [rule.fieldName]
    });
  });

  return finalSchema;
};