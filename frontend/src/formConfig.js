const processFormConfig = (config) => {
    const defaultErrorMessages = {
      required: 'This field is required',
      minLength: 'Minimum length is {min}',
      maxLength: 'Maximum length is {max}',
      length: 'Length must be {len}',
      pattern: 'Invalid format',
      format: 'Invalid format',
      lowercase: 'Must be lowercase',
      uppercase: 'Must be uppercase',
      trim: 'Cannot start or end with spaces',
      min: 'Must be at least {min}',
      max: 'Must be at most {max}',
      lessThan: 'Must be less than {value}',
      moreThan: 'Must be more than {value}',
      integer: 'Must be an integer',
      minDate: 'Must be on or after {min}',
      maxDate: 'Must be on or before {max}',
      maxToday: 'Cannot be after today',
      minToday: 'Cannot be before today',
      lengthArray: 'Must have exactly {len} items',
      minArray: 'Must have at least {min} items',
      maxArray: 'Must have at most {max} items',
      equalField: 'Must match the value of {field}',
      enum: 'Must be one of: {values}',
      notEnum: 'Must not be one of: {values}',
    };
  
    const rules = {};
    Object.keys(config.properties).forEach((field) => {
      const fieldConfig = config.properties[field];
      rules[field] = {
        type: fieldConfig.type || 'string',
        required: fieldConfig.required || false,
        minLength: fieldConfig.minLength || null,
        maxLength: fieldConfig.maxLength || null,
        length: fieldConfig.length || null,
        pattern: fieldConfig.pattern || null,
        format: fieldConfig.format || null,
        lowercase: fieldConfig.lowercase || false,
        uppercase: fieldConfig.uppercase || false,
        trim: fieldConfig.trim || false,
        min: fieldConfig.min || null,
        max: fieldConfig.max || null,
        lessThan: fieldConfig.lessThan || null,
        moreThan: fieldConfig.moreThan || null,
        integer: fieldConfig.integer || false,
        minDate: fieldConfig.minDate || null,
        maxDate: fieldConfig.maxDate || null,
        maxToday: fieldConfig.maxToday || false,
        minToday: fieldConfig.minToday || false,
        lengthArray: fieldConfig.lengthArray || null,
        minArray: fieldConfig.minArray || null,
        maxArray: fieldConfig.maxArray || null,
        equalField: fieldConfig.equalField || null,
        enum: fieldConfig.enum || null,
        notEnum: fieldConfig.notEnum || null,
        conditionalRules: fieldConfig.conditionalRules || [],
        errorMessages: {
          ...defaultErrorMessages,
          ...(fieldConfig.errorMessages || {}),
        },
      };
    });
  
    return rules;
  };
  
  // Fonction pour évaluer une condition ou un groupe de conditions
  const evaluateCondition = (condition, formData, formRules) => {
    console.log('Évaluation de la condition:', JSON.stringify(condition, null, 2));
    console.log('FormData:', formData);
  
    if (condition.conditions) {
      const { logic, list } = condition.conditions;
      console.log(`Groupe de conditions avec logique: ${logic}, liste:`, list);
  
      const results = list.map((cond, index) => {
        const result = evaluateCondition(cond, formData, formRules);
        console.log(`Résultat de la condition ${index + 1} (${JSON.stringify(cond)}):`, result);
        return result;
      });
  
      console.log('Résultats des conditions:', results);
  
      if (logic === 'AND') {
        const finalResult = results.every(result => result === true);
        console.log('Résultat final (AND):', finalResult);
        return finalResult;
      } else if (logic === 'OR') {
        const finalResult = results.some(result => result === true);
        console.log('Résultat final (OR):', finalResult);
        return finalResult;
      }
      console.log('Logique invalide, retourne false');
      return false;
    }
  
    // Gestion des conditions simples encapsulées dans { condition: ... }
    if (condition.condition) {
      const cond = condition.condition;

      const fieldValue = formData[cond.field];
      const fieldRules = formRules[cond.field];
      console.log(`Valeur de ${cond.field}:`, fieldValue, `Règles de ${cond.field}:`, fieldRules);

      if (cond.values) {
        let compareValue = fieldValue;
        // Convertit la valeur selon le type du champ
        if (fieldRules.type === 'number') {
          compareValue = Number(fieldValue);
        } else if (fieldRules.type === 'date') {
          compareValue = new Date(fieldValue);
        } else if (fieldRules.type === 'boolean') {
          compareValue = fieldValue;
        } else {
          compareValue = String(fieldValue);
        }
        const result = cond.values.includes(compareValue);
        console.log(`Condition "in" (${cond.field} dans ${cond.values}):`, result);
        return result;
      }

      if (cond.pattern) {
        const result = new RegExp(cond.pattern).test(fieldValue);
        console.log(`Condition "matches" (${cond.field} avec pattern ${cond.pattern}):`, result);
        return result;
      }

      if (cond.operator) {
        let compareValue = fieldValue;
        let targetValue = cond.value;

        if (fieldRules.type === 'number') {
          compareValue = Number(fieldValue);
          targetValue = Number(targetValue);
        } else if (fieldRules.type === 'date') {
          compareValue = new Date(fieldValue);
          targetValue = new Date(targetValue);
          compareValue.setHours(0, 0, 0, 0);
          targetValue.setHours(0, 0, 0, 0);
        } else if (fieldRules.type === 'boolean') {
          compareValue = fieldValue;
          targetValue = cond.value;
        } else {
          compareValue = String(fieldValue);
          targetValue = String(targetValue);
        }
        console.log(`Comparaison: ${compareValue} ${cond.operator} ${targetValue}`);

        switch (cond.operator) {
          case '>': return compareValue > targetValue;
          case '<': return compareValue < targetValue;
          case '=': return compareValue === targetValue;
          case '>=': return compareValue >= targetValue;
          case '<=': return compareValue <= targetValue;
          case '!=': return compareValue !== targetValue;
          default: return false;
        }
      }

      console.log('Aucune condition reconnue, retourne false');
      return false;
    }

    // Gestion des conditions directes
    const cond = condition;

    const fieldValue = formData[cond.field];
    const fieldRules = formRules[cond.field];
    console.log(`Valeur de ${cond.field}:`, fieldValue, `Règles de ${cond.field}:`, fieldRules);

    if (cond.values) {
      let compareValue = fieldValue;
      // Convertit la valeur selon le type du champ
      if (fieldRules.type === 'number') {
        compareValue = Number(fieldValue);
      } else if (fieldRules.type === 'date') {
        compareValue = new Date(fieldValue);
      } else if (fieldRules.type === 'boolean') {
        compareValue = fieldValue;
      } else {
        compareValue = String(fieldValue);
      }
      const result = cond.values.includes(compareValue);
      console.log(`Condition "in" (${cond.field} dans ${cond.values}):`, result);
      return result;
    }

    if (cond.pattern) {
      const result = new RegExp(cond.pattern).test(fieldValue);
      console.log(`Condition "matches" (${cond.field} avec pattern ${cond.pattern}):`, result);
      return result;
    }

    if (cond.operator) {
      let compareValue = fieldValue;
      let targetValue = cond.value;

      if (fieldRules.type === 'number') {
        compareValue = Number(fieldValue);
        targetValue = Number(targetValue);
      } else if (fieldRules.type === 'date') {
        compareValue = new Date(fieldValue);
        targetValue = new Date(targetValue);
        compareValue.setHours(0, 0, 0, 0);
        targetValue.setHours(0, 0, 0, 0);
      } else if (fieldRules.type === 'boolean') {
        compareValue = fieldValue;
        targetValue = cond.value;
      } else {
        compareValue = String(fieldValue);
        targetValue = String(targetValue);
      }
      console.log(`Comparaison: ${compareValue} ${cond.operator} ${targetValue}`);

      switch (cond.operator) {
        case '>': return compareValue > targetValue;
        case '<': return compareValue < targetValue;
        case '=': return compareValue === targetValue;
        case '>=': return compareValue >= targetValue;
        case '<=': return compareValue <= targetValue;
        case '!=': return compareValue !== targetValue;
        default: return false;
      }
    }

    console.log('Aucune condition reconnue, retourne false');
    return false;
  };
  
  // Fonction pour appliquer les règles conditionnelles
  const applyConditionalRules = (rules, formData, formRules) => {
    const updatedRules = { ...rules }; // Crée une copie des règles
  
    Object.keys(updatedRules).forEach((field) => {
      const fieldRules = updatedRules[field];
      const conditionalRules = fieldRules.conditionalRules || [];
      console.log(`Application des règles conditionnelles pour le champ: ${field}`, conditionalRules); // Log 16: Affiche les règles conditionnelles du champ
  
      // Parcourt toutes les règles conditionnelles du champ
      conditionalRules.forEach((rule, index) => {
        // Évalue la condition ou le groupe de conditions
        const isConditionTrue = evaluateCondition(rule, formData, formRules);
        console.log(`Règle conditionnelle ${index + 1} pour ${field} - Condition vraie ?`, isConditionTrue); // Log 17: Affiche si la condition est vraie
  
        // Applique l'action ou l'else en fonction du résultat
        const actionToApply = isConditionTrue ? rule.action : rule.else;
        console.log(`Action appliquée pour ${field}:`, actionToApply); // Log 18: Affiche l'action ou l'else appliqué
        if (actionToApply) {
          // Met à jour les règles du champ avec les nouvelles valeurs
          Object.keys(actionToApply).forEach((key) => {
            fieldRules[key] = actionToApply[key];
          });
        }
        console.log(`Règles mises à jour pour ${field}:`, fieldRules); // Log 19: Affiche les règles mises à jour
      });
    });
  
    console.log('Règles finales après application des conditions:', updatedRules); // Log 20: Affiche les règles finales
    return updatedRules;
  };
  
  const validateField = (value, rules, fieldName, formData) => {
    const errors = [];
  
    // General rules
    if (rules.required) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors.push(rules.errorMessages.required);
        return errors; // Stop validation if required fails
      }
    }
  
    // Skip further validation if value is empty and not required
    if (!rules.required) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return errors;
      }
    }
  
    // Convert value based on type
    const isString = rules.type === 'string';
    const isNumber = rules.type === 'number';
    const isDate = rules.type === 'date';
    const isArray = rules.type === 'array';
    const strValue = isString ? String(value) : String(value);
    const numValue = isNumber ? Number(value) : null;
    const dateValue = isDate ? new Date(value) : null;
    const arrValue = isArray ? (Array.isArray(value) ? value : []) : null;
  
    if (isNumber && isNaN(numValue)) {
      errors.push('Must be a valid number');
      return errors;
    }
  
    if (isDate && isNaN(dateValue.getTime())) {
      errors.push('Must be a valid date');
      return errors;
    }
  
    if (isArray && !Array.isArray(arrValue)) {
      errors.push('Must be an array');
      return errors;
    }
  
    if (rules.type === 'string') {
      if (rules.trim && (strValue.startsWith(' ') || strValue.endsWith(' '))) {
        errors.push(rules.errorMessages.trim);
      }
  
      const trimmedValue = strValue.trim();
  
      if (rules.minLength && trimmedValue.length < rules.minLength) {
        errors.push(rules.errorMessages.minLength.replace('{min}', rules.minLength));
      }
  
      if (rules.maxLength && trimmedValue.length > rules.maxLength) {
        errors.push(rules.errorMessages.maxLength.replace('{max}', rules.maxLength));
      }
  
      if (rules.length && trimmedValue.length !== rules.length) {
        errors.push(rules.errorMessages.length.replace('{len}', rules.length));
      }
  
      if (rules.pattern && !new RegExp(rules.pattern).test(trimmedValue)) {
        errors.push(rules.errorMessages.pattern);
      }
  
      if (rules.format && !new RegExp(rules.format).test(trimmedValue)) {
        errors.push(rules.errorMessages.format);
      }
  
      if (rules.lowercase && trimmedValue !== trimmedValue.toLowerCase()) {
        errors.push(rules.errorMessages.lowercase);
      }
  
      if (rules.uppercase && trimmedValue !== trimmedValue.toUpperCase()) {
        errors.push(rules.errorMessages.uppercase);
      }

      // Règle : enum pour string
      if (rules.enum) {
        if (!rules.enum.includes(strValue)) {
          errors.push(rules.errorMessages.enum.replace('{values}', rules.enum.join(', ')));
        }
      }

      // Règle : notEnum pour string
      if (rules.notEnum) {
        if (rules.notEnum.includes(strValue)) {
          errors.push(rules.errorMessages.notEnum.replace('{values}', rules.notEnum.join(', ')));
        }
      }

      // Règle : equalField pour string
      if (rules.equalField) {
        const targetValue = formData[rules.equalField];
        const compareTargetValue = String(targetValue);
        if (strValue !== compareTargetValue) {
          errors.push(rules.errorMessages.equalField.replace('{field}', rules.equalField));
        }
      }
    }
  
    if (rules.type === 'number') {
      if (rules.min !== null && numValue < rules.min) {
        errors.push(rules.errorMessages.min.replace('{min}', rules.min));
      }
  
      if (rules.max !== null && numValue > rules.max) {
        errors.push(rules.errorMessages.max.replace('{max}', rules.max));
      }
  
      if (rules.lessThan !== null && numValue >= rules.lessThan) {
        errors.push(rules.errorMessages.lessThan.replace('{value}', rules.lessThan));
      }
  
      if (rules.moreThan !== null && numValue <= rules.moreThan) {
        errors.push(rules.errorMessages.moreThan.replace('{value}', rules.moreThan));
      }
  
      if (rules.integer && !Number.isInteger(numValue)) {
        errors.push(rules.errorMessages.integer);
      }

      // Règle : enum pour number
      if (rules.enum) {
        if (!rules.enum.includes(numValue)) {
          errors.push(rules.errorMessages.enum.replace('{values}', rules.enum.join(', ')));
        }
      }

      // Règle : notEnum pour number
      if (rules.notEnum) {
        if (rules.notEnum.includes(numValue)) {
          errors.push(rules.errorMessages.notEnum.replace('{values}', rules.notEnum.join(', ')));
        }
      }

      // Règle : equalField pour number
      if (rules.equalField) {
        const targetValue = formData[rules.equalField];
        const compareTargetValue = Number(targetValue);
        if (numValue !== compareTargetValue) {
          errors.push(rules.errorMessages.equalField.replace('{field}', rules.equalField));
        }
      }
    }
  
    if (rules.type === 'date') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const normalizedDateValue = new Date(dateValue);
      normalizedDateValue.setHours(0, 0, 0, 0);
  
      if (rules.minDate && normalizedDateValue < new Date(rules.minDate)) {
        errors.push(rules.errorMessages.minDate.replace('{min}', new Date(rules.minDate).toLocaleDateString()));
      }
  
      if (rules.maxDate && normalizedDateValue > new Date(rules.maxDate)) {
        errors.push(rules.errorMessages.maxDate.replace('{max}', new Date(rules.maxDate).toLocaleDateString()));
      }
  
      if (rules.maxToday && normalizedDateValue > today) {
        errors.push(rules.errorMessages.maxToday);
      }
  
      if (rules.minToday && normalizedDateValue < today) {
        errors.push(rules.errorMessages.minToday);
      }

      // Règle : enum pour date
      if (rules.enum) {
        const normalizedEnumDates = rules.enum.map(date => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });
        if (!normalizedEnumDates.includes(normalizedDateValue.getTime())) {
          errors.push(rules.errorMessages.enum.replace('{values}', rules.enum.map(d => new Date(d).toLocaleDateString()).join(', ')));
        }
      }

      // Règle : notEnum pour date
      if (rules.notEnum) {
        const normalizedNotEnumDates = rules.notEnum.map(date => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });
        if (normalizedNotEnumDates.includes(normalizedDateValue.getTime())) {
          errors.push(rules.errorMessages.notEnum.replace('{values}', rules.notEnum.map(d => new Date(d).toLocaleDateString()).join(', ')));
        }
      }

      // Règle : equalField pour date
      if (rules.equalField) {
        const targetValue = formData[rules.equalField];
        const compareTargetValue = new Date(targetValue);
        compareTargetValue.setHours(0, 0, 0, 0);
        if (normalizedDateValue.getTime() !== compareTargetValue.getTime()) {
          errors.push(rules.errorMessages.equalField.replace('{field}', rules.equalField));
        }
      }
    }
  
    if (rules.type === 'array') {
      if (rules.lengthArray !== null && arrValue.length !== rules.lengthArray) {
        errors.push(rules.errorMessages.lengthArray.replace('{len}', rules.lengthArray));
      }
  
      if (rules.minArray !== null && arrValue.length < rules.minArray) {
        errors.push(rules.errorMessages.minArray.replace('{min}', rules.minArray));
      }
  
      if (rules.maxArray !== null && arrValue.length > rules.maxArray) {
        errors.push(rules.errorMessages.maxArray.replace('{max}', rules.maxArray));
      }

      // Règle : enum pour array
      if (rules.enum) {
        const invalidItems = arrValue.filter(item => !rules.enum.includes(item));
        if (invalidItems.length > 0) {
          errors.push(rules.errorMessages.enum.replace('{values}', rules.enum.join(', ')));
        }
      }

      // Règle : notEnum pour array
      if (rules.notEnum) {
        const invalidItems = arrValue.filter(item => rules.notEnum.includes(item));
        if (invalidItems.length > 0) {
          errors.push(rules.errorMessages.notEnum.replace('{values}', rules.notEnum.join(', ')));
        }
      }

      // Règle : equalField pour array
      if (rules.equalField) {
        const targetValue = formData[rules.equalField];
        const compareTargetValue = Array.isArray(targetValue) ? targetValue : [];
        if (JSON.stringify(arrValue) !== JSON.stringify(compareTargetValue)) {
          errors.push(rules.errorMessages.equalField.replace('{field}', rules.equalField));
        }
      }
    }
  
    return errors.length > 0 ? errors : null;
  };
  
  const validateForm = (formData, formRules) => {
    const updatedRules = applyConditionalRules(formRules, formData, formRules);
  
    const errors = {};
    Object.keys(updatedRules).forEach((field) => {
      const fieldErrors = validateField(formData[field], updatedRules[field], field, formData);
      if (fieldErrors) {
        errors[field] = fieldErrors[0];
      }
    });
    return errors;
  };
  
  export { processFormConfig, validateForm };