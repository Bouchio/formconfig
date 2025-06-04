import { z } from 'zod';

const formatErrorMessage = (message, params = {}) => {
  if (typeof message !== 'string') {
    return "An unknown validation error occurred.";
  }
  let formatted = message;
  for (const key in params) {
    if (key === 'fields' && Array.isArray(params[key])) {
      formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key].join(', '));
    } else {
      formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
    }
  }
  return formatted;
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
    "minDate": "La date doit être égale ou postérieure au {minDate}.",
    "maxDate": "La date doit être égale ou antérieure au {maxDate}.",
    "maxToday": "La date ne peut pas être dans le futur.",
    "minToday": "La date ne peut pas être dans le passé.",
    "minArray": "Minimum {min} éléments requis.",
    "maxArray": "Maximum {max} éléments autorisés.",
    "lengthArray": "Doit contenir exactement {len} éléments.",
    "enum": "Doit être l'une des valeurs suivantes : {values}.",
    "notEnum": "Ne doit pas être l'une des valeurs suivantes : {values}.",
    "trim": "Ne peut pas commencer ou se terminer par des espaces.",
    "lowercase": "Doit être en minuscules.",
    "uppercase": "Doit être en majuscules.",
    "equals": "Doit être égal aux champs {fields}.",
    "notEquals": "Ne peut pas être égal aux champs {fields}."
  };

  const interFieldComparisonRules = [];
  const interFieldNotEqualsRules = [];

  config.fields.forEach((fieldConfig) => {
    const { name, type, validations = {}, generate } = fieldConfig;
    const fieldErrorMessages = { ...globalMessages, ...(validations.errorMessage || {}) };
    let currentFieldSchema;

    // Si le champ est généré automatiquement, on ignore les validations manuelles
    if (generate) {
      currentFieldSchema = z.string().optional(); // Les champs générés sont en lecture seule
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
          currentFieldSchema = currentFieldSchema.regex(new RegExp(validations.pattern), { message: fieldErrorMessages.pattern });
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
          currentFieldSchema = currentFieldSchema.refine(
            (val) => {
              const date = new Date(val);
              const minDate = new Date(validations.minDate);
              return !isNaN(date.getTime()) && !isNaN(minDate.getTime()) && date >= minDate;
            },
            { message: formatErrorMessage(fieldErrorMessages.minDate, { minDate: validations.minDate }) }
          );
        }
        if (validations.maxDate) {
          currentFieldSchema = currentFieldSchema.refine(
            (val) => {
              const date = new Date(val);
              const maxDate = new Date(validations.maxDate);
              return !isNaN(date.getTime()) && !isNaN(maxDate.getTime()) && date <= maxDate;
            },
            { message: formatErrorMessage(fieldErrorMessages.maxDate, { maxDate: validations.maxDate }) }
          );
        }
        if (validations.maxToday) {
          currentFieldSchema = currentFieldSchema.refine(
            (val) => {
              const date = new Date(val);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return !isNaN(date.getTime()) && date <= today;
            },
            { message: fieldErrorMessages.maxToday }
          );
        }
        if (validations.minToday) {
          currentFieldSchema = currentFieldSchema.refine(
            (val) => {
              const date = new Date(val);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return !isNaN(date.getTime()) && date >= today;
            },
            { message: fieldErrorMessages.minToday }
          );
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
            { message: fieldErrorMessages.required || globalMessages.required || "Ce champ est obligatoire." }
          );
      } else {
        currentFieldSchema = currentFieldSchema.nullable().optional();
      }

      if (validations.equals !== undefined) {
        const equalsValue = validations.equals;
        if (typeof equalsValue === 'string' && equalsValue.startsWith('$')) {
          const compareFieldName = equalsValue.substring(1);
          interFieldComparisonRules.push({
            fieldName: name,
            compareFields: [compareFieldName],
            errorMessage: formatErrorMessage(fieldErrorMessages.equals, { fields: [compareFieldName] })
          });
        } else if (Array.isArray(equalsValue) && equalsValue.every(val => typeof val === 'string' && val.startsWith('$'))) {
          const compareFieldNames = equalsValue.map(val => val.substring(1));
          interFieldComparisonRules.push({
            fieldName: name,
            compareFields: compareFieldNames,
            errorMessage: formatErrorMessage(fieldErrorMessages.equals, { fields: compareFieldNames })
          });
        } else {
          console.warn(`Validation 'equals' for field '${name}' must be a string starting with '$' or an array of such strings.`);
        }
      }

      if (validations.notEquals !== undefined) {
        const notEqualsValue = validations.notEquals;
        if (typeof notEqualsValue === 'string' && notEqualsValue.startsWith('$')) {
          const compareFieldName = notEqualsValue.substring(1);
          interFieldNotEqualsRules.push({
            fieldName: name,
            compareFields: [compareFieldName],
            errorMessage: formatErrorMessage(fieldErrorMessages.notEquals, { fields: [compareFieldName] })
          });
        } else if (Array.isArray(notEqualsValue) && notEqualsValue.every(val => typeof val === 'string' && val.startsWith('$'))) {
          const compareFieldNames = notEqualsValue.map(val => val.substring(1));
          interFieldNotEqualsRules.push({
            fieldName: name,
            compareFields: compareFieldNames,
            errorMessage: formatErrorMessage(fieldErrorMessages.notEquals, { fields: compareFieldNames })
          });
        } else {
          console.warn(`Validation 'notEquals' for field '${name}' must be a string starting with '$' or an array of such strings.`);
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

  return finalSchema;
};