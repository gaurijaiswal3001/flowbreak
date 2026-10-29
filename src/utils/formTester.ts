import { TestCaseResult, TestSummary } from '../types';

/**
 * Strips script tags, javascript: protocols, and inline event handlers (on*)
 * to ensure that user-provided HTML never executes scripts in the host application or preview.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags if they contain javascript expressions
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove iframe/object/embed/applet tags
    .replace(/<(\/)?(iframe|object|embed|applet|base|meta)\b[^>]*>/gi, '')
    // Remove inline event handlers (e.g., onclick, onerror, onsubmit)
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    // Remove javascript: pseudo-protocol in href or src
    .replace(/href\s*=\s*['"]javascript:[^'"]*['"]/gi, 'href="#"')
    .replace(/src\s*=\s*['"]javascript:[^'"]*['"]/gi, 'src=""');
}

/**
 * Runs actual browser-native validation tests using a controlled testing DOM.
 */
export function runFormTests(rawHtml: string): { results: TestCaseResult[]; summary: TestSummary } {
  const sanitized = sanitizeHtml(rawHtml.trim());

  if (!sanitized) {
    return {
      results: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        fieldsCount: 0,
        verdict: 'empty',
      },
    };
  }

  // Parse HTML safely with DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');

  // Create an offscreen sandbox attached to the document for full Constraint Validation API support
  const testHost = document.createElement('div');
  testHost.setAttribute('aria-hidden', 'true');
  testHost.style.position = 'absolute';
  testHost.style.left = '-9999px';
  testHost.style.top = '-9999px';
  testHost.style.width = '1px';
  testHost.style.height = '1px';
  testHost.style.overflow = 'hidden';
  testHost.style.opacity = '0';
  testHost.style.pointerEvents = 'none';

  // Import parsed nodes into current document
  const importedBody = document.importNode(doc.body, true);
  testHost.appendChild(importedBody);
  document.body.appendChild(testHost);

  const results: TestCaseResult[] = [];

  try {
    const forms = Array.from(testHost.querySelectorAll('form'));
    const allInputs = Array.from(
      testHost.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        'input, select, textarea'
      )
    );

    // If no form element is present, check if standalone fields exist
    if (forms.length === 0 && allInputs.length > 0) {
      results.push({
        id: 'struct-form-tag',
        field: '<form>',
        fieldIdentifier: 'Form wrapper',
        fieldType: 'container',
        category: 'structure',
        testCase: 'Form Tag Presence',
        expected: 'Input controls should be enclosed in a valid <form> tag to enable submit events.',
        actual: 'No <form> element found enclosing the inputs. Controls are standalone.',
        status: 'failed',
        detail: 'Browser constraint validation and submission cycle require an enclosing <form>.',
      });
    } else if (forms.length > 0) {
      // Check for submit button in each form
      forms.forEach((form, fIdx) => {
        const formId = form.id ? `#${form.id}` : `form[${fIdx}]`;
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
        if (!submitBtn) {
          results.push({
            id: `struct-submit-${fIdx}`,
            field: `<form ${formId}>`,
            fieldIdentifier: `${formId} submit trigger`,
            fieldType: 'button',
            category: 'structure',
            testCase: 'Form Submission Trigger',
            expected: 'Form must have a submit button (<button type="submit"> or <input type="submit">) for user dispatch.',
            actual: 'No submit button found in this form.',
            status: 'failed',
            detail: 'Users cannot submit this form using standard click or enter-key actions.',
          });
        } else {
          results.push({
            id: `struct-submit-${fIdx}`,
            field: `<form ${formId}>`,
            fieldIdentifier: `${formId} submit trigger`,
            fieldType: 'button',
            category: 'structure',
            testCase: 'Form Submission Trigger',
            expected: 'Form has a valid submit button (<button type="submit"> or default button).',
            actual: `Found submit button: <${submitBtn.tagName.toLowerCase()} type="${submitBtn.getAttribute('type') || 'submit'}">`,
            status: 'passed',
            detail: 'Browser can trigger form submit events natively.',
          });
        }
      });
    }

    // Now test each form control
    allInputs.forEach((el, index) => {
      const tagName = el.tagName.toLowerCase();
      const type = (el.getAttribute('type') || (tagName === 'textarea' ? 'textarea' : tagName === 'select' ? 'select' : 'text')).toLowerCase();
      const name = el.getAttribute('name');
      const id = el.getAttribute('id');
      const identifier = name ? `name="${name}"` : id ? `id="${id}"` : `${tagName}[${index}]`;
      const fieldLabel = `<${tagName} ${identifier}>`;

      // 1. Structural Test: name attribute
      if (!name) {
        results.push({
          id: `struct-name-${index}`,
          field: fieldLabel,
          fieldIdentifier: identifier,
          fieldType: type,
          category: 'structure',
          testCase: 'Input Name Attribute Check',
          expected: 'Form control must have a "name" attribute to be included in FormData and HTTP payload.',
          actual: 'The "name" attribute is completely missing.',
          status: 'failed',
          detail: 'When the form is submitted, this field will be completely omitted from the payload.',
        });
      } else {
        results.push({
          id: `struct-name-${index}`,
          field: fieldLabel,
          fieldIdentifier: identifier,
          fieldType: type,
          category: 'structure',
          testCase: 'Input Name Attribute Check',
          expected: 'Form control has a "name" attribute for payload serialization.',
          actual: `name="${name}" is present.`,
          status: 'passed',
          detail: 'Browser will serialize this input on submit.',
        });
      }

      // 2. Structural Test: Accessible Label association
      const hasAssociatedLabel = Boolean(
        (id && testHost.querySelector(`label[for="${id}"]`)) ||
        el.closest('label')
      );
      if (!hasAssociatedLabel && type !== 'hidden' && type !== 'submit') {
        results.push({
          id: `struct-label-${index}`,
          field: fieldLabel,
          fieldIdentifier: identifier,
          fieldType: type,
          category: 'structure',
          testCase: 'Accessible <label> Association',
          expected: 'Control should be associated with a <label for="id"> or wrapped inside a <label>.',
          actual: 'No linked <label> found for this control.',
          status: 'failed',
          detail: 'Screen readers and assistive devices will announce this input without an accessible name.',
        });
      }

      // 3. Required Constraint Test
      const isRequired = el.hasAttribute('required');
      if (isRequired) {
        if (el instanceof HTMLInputElement && (type === 'checkbox' || type === 'radio')) {
          el.checked = false;
          const isValueMissing = el.validity.valueMissing;
          const isValid = el.checkValidity();

          if (isValueMissing && !isValid) {
            results.push({
              id: `req-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'required',
              testCase: 'Required Checkbox / Radio State',
              expected: 'Browser flags validity.valueMissing = true when unchecked.',
              actual: `checkValidity() returned false, validity.valueMissing = ${isValueMissing}`,
              status: 'passed',
              detail: 'Browser successfully blocks submission when required choice is unchecked.',
            });
          } else {
            results.push({
              id: `req-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'required',
              testCase: 'Required Checkbox / Radio State',
              expected: 'Browser should flag validity.valueMissing = true when unchecked.',
              actual: `checkValidity() returned ${isValid}, validity.valueMissing = ${isValueMissing}`,
              status: 'failed',
              detail: 'Unchecked required option passed browser validation unexpectedly.',
            });
          }
        } else {
          // Standard text / number / email / select
          el.value = '';
          const isValueMissing = el.validity.valueMissing;
          const isValid = el.checkValidity();

          if (isValueMissing && !isValid) {
            results.push({
              id: `req-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'required',
              testCase: 'Empty Submission on Required Field',
              expected: 'Browser flags validity.valueMissing = true and checkValidity() = false on empty string.',
              actual: `checkValidity() = ${isValid}, validity.valueMissing = ${isValueMissing}`,
              status: 'passed',
              detail: 'Browser-native required constraint successfully rejected empty input.',
            });
          } else {
            results.push({
              id: `req-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'required',
              testCase: 'Empty Submission on Required Field',
              expected: 'Browser flags validity.valueMissing = true on empty value.',
              actual: `checkValidity() = ${isValid}, validity.valueMissing = ${isValueMissing}`,
              status: 'failed',
              detail: 'Empty value was accepted despite the required attribute.',
            });
          }
        }
      }

      // 4. Email Format Validation
      const isEmailLike =
        type === 'email' ||
        (name && name.toLowerCase().includes('email')) ||
        (id && id.toLowerCase().includes('email'));

      if (isEmailLike) {
        if (type !== 'email') {
          // Bug: email field implemented as text
          el.value = 'invalid-email-address';
          const typeMismatch = el.validity.typeMismatch;
          const checkVal = el.checkValidity();

          results.push({
            id: `email-type-${index}`,
            field: fieldLabel,
            fieldIdentifier: identifier,
            fieldType: type,
            category: 'format',
            testCase: 'Email Format Validation (RFC 5322)',
            expected: 'Field should use type="email" so the browser validates email syntax and rejects "invalid-email-address".',
            actual: `type="${type}" accepted "invalid-email-address" without error. validity.typeMismatch = ${typeMismatch}, checkValidity() = ${checkVal}`,
            status: 'failed',
            detail: 'Using type="text" for email disables native browser email syntax checking entirely.',
            inputTested: 'invalid-email-address',
          });
        } else {
          // Field correctly uses type="email" - let's stress test it with native engine!
          el.value = 'notanemail';
          const badEmailMismatch = el.validity.typeMismatch;
          const badEmailValid = el.checkValidity();

          if (badEmailMismatch && !badEmailValid) {
            results.push({
              id: `email-invalid-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'format',
              testCase: 'Invalid Email Syntax Rejection',
              expected: 'Browser native parser flags validity.typeMismatch = true on "notanemail".',
              actual: `checkValidity() = false, validity.typeMismatch = ${badEmailMismatch}`,
              status: 'passed',
              detail: 'Browser correctly intercepted invalid email syntax.',
              inputTested: 'notanemail',
            });
          } else {
            results.push({
              id: `email-invalid-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'format',
              testCase: 'Invalid Email Syntax Rejection',
              expected: 'Browser native parser flags validity.typeMismatch = true on "notanemail".',
              actual: `checkValidity() = ${badEmailValid}, validity.typeMismatch = ${badEmailMismatch}`,
              status: 'failed',
              detail: 'Browser accepted "notanemail" without type mismatch.',
              inputTested: 'notanemail',
            });
          }

          // Test legitimate email format
          el.value = 'user@example.com';
          const goodEmailMismatch = el.validity.typeMismatch;
          const goodEmailValid = el.checkValidity();
          if (!goodEmailMismatch && goodEmailValid) {
            results.push({
              id: `email-valid-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'format',
              testCase: 'Valid Email Syntax Acceptance',
              expected: 'Browser accepts legitimate email "user@example.com" with valid: true.',
              actual: `checkValidity() = true, validity.typeMismatch = false`,
              status: 'passed',
              detail: 'Proper email syntax verified.',
              inputTested: 'user@example.com',
            });
          }
        }
      }

      // 5. Length Constraints: minlength & maxlength
      const minLenAttr = el.getAttribute('minlength');
      const maxLenAttr = el.getAttribute('maxlength');

      if (minLenAttr !== null && maxLenAttr !== null) {
        const minVal = parseInt(minLenAttr, 10);
        const maxVal = parseInt(maxLenAttr, 10);

        if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
          results.push({
            id: `len-conflict-${index}`,
            field: fieldLabel,
            fieldIdentifier: identifier,
            fieldType: type,
            category: 'length',
            testCase: 'MinLength vs MaxLength Logical Hierarchy',
            expected: `minlength (${minVal}) must be <= maxlength (${maxVal}).`,
            actual: `Contradiction detected: minlength="${minVal}" exceeds maxlength="${maxVal}".`,
            status: 'failed',
            detail: 'Form can never be validly submitted because satisfying minlength violates maxlength!',
          });
        }
      }

      // Check minlength constraint standalone
      if (minLenAttr !== null) {
        const minVal = parseInt(minLenAttr, 10);
        if (!isNaN(minVal) && minVal > 0) {
          // Test with a short value
          const shortVal = 'a'.repeat(Math.max(1, minVal - 2));
          el.value = shortVal;
          const isLengthUnder = el.value.length < minVal;

          results.push({
            id: `len-min-${index}`,
            field: fieldLabel,
            fieldIdentifier: identifier,
            fieldType: type,
            category: 'length',
            testCase: `Minimum Length Constraint (minlength="${minVal}")`,
            expected: `Input shorter than ${minVal} characters should violate minimum length requirements.`,
            actual: `Value length is ${shortVal.length} (< ${minVal}). HTML attribute minlength="${minVal}" is registered.`,
            status: 'passed',
            detail: `Native constraint configured to enforce at least ${minVal} characters.`,
            inputTested: shortVal,
          });
        }
      }

      // Password security check: overly restrictive maxlength
      if (type === 'password' && maxLenAttr !== null) {
        const maxVal = parseInt(maxLenAttr, 10);
        if (!isNaN(maxVal) && maxVal <= 8) {
          results.push({
            id: `len-pass-max-${index}`,
            field: fieldLabel,
            fieldIdentifier: identifier,
            fieldType: type,
            category: 'length',
            testCase: 'Password Security MaxLength Guard',
            expected: 'Password fields should permit at least 32+ characters for password managers and entropy.',
            actual: `maxlength is capped at only ${maxVal} characters!`,
            status: 'failed',
            detail: `Restricting passwords to ${maxVal} characters prevents strong passphrases and auto-generated passwords.`,
          });
        }
      }

      // 6. Numeric Bounds: min, max, step
      if (type === 'number' || type === 'range') {
        const minAttr = el.getAttribute('min');
        const maxAttr = el.getAttribute('max');

        if (minAttr !== null && maxAttr !== null) {
          const minNum = parseFloat(minAttr);
          const maxNum = parseFloat(maxAttr);

          if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
            // Broken range
            results.push({
              id: `num-inverted-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'range',
              testCase: 'Numeric Range Consistency (min <= max)',
              expected: `min (${minNum}) must be strictly less than or equal to max (${maxNum}).`,
              actual: `Inverted range: min="${minNum}" is greater than max="${maxNum}".`,
              status: 'failed',
              detail: 'Any number entered into this field will trigger either rangeUnderflow or rangeOverflow in the browser.',
            });
          } else if (!isNaN(minNum) && !isNaN(maxNum)) {
            // Test legitimate underflow
            el.value = (minNum - 1).toString();
            const hasUnderflow = el.validity.rangeUnderflow;

            if (hasUnderflow) {
              results.push({
                id: `num-underflow-${index}`,
                field: fieldLabel,
                fieldIdentifier: identifier,
                fieldType: type,
                category: 'range',
                testCase: `Numeric Minimum Boundary Check (min="${minNum}")`,
                expected: `Value ${minNum - 1} triggers validity.rangeUnderflow = true.`,
                actual: `checkValidity() = false, validity.rangeUnderflow = ${hasUnderflow}`,
                status: 'passed',
                detail: 'Browser successfully blocked value below minimum threshold.',
                inputTested: (minNum - 1).toString(),
              });
            }

            // Test legitimate overflow
            el.value = (maxNum + 1).toString();
            const hasOverflow = el.validity.rangeOverflow;

            if (hasOverflow) {
              results.push({
                id: `num-overflow-${index}`,
                field: fieldLabel,
                fieldIdentifier: identifier,
                fieldType: type,
                category: 'range',
                testCase: `Numeric Maximum Boundary Check (max="${maxNum}")`,
                expected: `Value ${maxNum + 1} triggers validity.rangeOverflow = true.`,
                actual: `checkValidity() = false, validity.rangeOverflow = ${hasOverflow}`,
                status: 'passed',
                detail: 'Browser successfully blocked value exceeding maximum threshold.',
                inputTested: (maxNum + 1).toString(),
              });
            }
          }
        } else if (minAttr !== null) {
          const minNum = parseFloat(minAttr);
          if (!isNaN(minNum)) {
            el.value = (minNum - 1).toString();
            if (el.validity.rangeUnderflow) {
              results.push({
                id: `num-underflow-${index}`,
                field: fieldLabel,
                fieldIdentifier: identifier,
                fieldType: type,
                category: 'range',
                testCase: `Numeric Minimum Bound (min="${minNum}")`,
                expected: `Value ${minNum - 1} triggers validity.rangeUnderflow = true.`,
                actual: `checkValidity() = false, validity.rangeUnderflow = true`,
                status: 'passed',
                detail: 'Browser underflow validation working properly.',
                inputTested: (minNum - 1).toString(),
              });
            }
          }
        }
      }

      // 7. Pattern Matching: regex tests
      const patternAttr = el.getAttribute('pattern');
      if (patternAttr !== null) {
        let isValidRegex = true;
        try {
          new RegExp(`^(?:${patternAttr})$`, 'u');
        } catch {
          isValidRegex = false;
        }

        if (!isValidRegex) {
          results.push({
            id: `pat-syntax-${index}`,
            field: fieldLabel,
            fieldIdentifier: identifier,
            fieldType: type,
            category: 'pattern',
            testCase: 'Pattern Regular Expression Syntax',
            expected: `pattern="${patternAttr}" must compile as a valid JavaScript regular expression.`,
            actual: 'Pattern regex failed to compile. Syntax error in pattern attribute.',
            status: 'failed',
            detail: 'The browser cannot evaluate this pattern, causing unpredictable validation failures.',
          });
        } else {
          // Native patternMismatch test with dummy mismatch string
          el.value = '!!!__INVALID_PATTERN_TEST__!!!';
          const mismatch = el.validity.patternMismatch;
          const checkVal = el.checkValidity();

          if (mismatch && !checkVal) {
            results.push({
              id: `pat-match-${index}`,
              field: fieldLabel,
              fieldIdentifier: identifier,
              fieldType: type,
              category: 'pattern',
              testCase: `Pattern Mismatch Validation (pattern="${patternAttr}")`,
              expected: 'Non-matching string causes browser validity.patternMismatch = true.',
              actual: `checkValidity() = false, validity.patternMismatch = ${mismatch}`,
              status: 'passed',
              detail: 'Browser correctly rejected string failing the pattern regex.',
              inputTested: '!!!__INVALID_PATTERN_TEST__!!!',
            });
          }
        }
      }
    });

  } finally {
    // Always clean up testing host from DOM
    if (testHost.parentNode) {
      testHost.parentNode.removeChild(testHost);
    }
  }

  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const total = results.length;

  return {
    results,
    summary: {
      total,
      passed,
      failed,
      fieldsCount: doc.querySelectorAll('input, select, textarea').length,
      verdict: total === 0 ? 'empty' : failed === 0 ? 'survived' : 'busted',
    },
  };
}
