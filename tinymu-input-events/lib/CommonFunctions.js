'use strict';

/**
 * General functions used on the ranvier-input-events bundle
 */

const srcPath = '../../../src/';
const Config  = require(srcPath + 'Config');

/**
 * @param {string} name
 * @return {boolean}
 */
exports.validateName = (name) => {
  const maxLength = Config.get('maxAccountNameLength');
  const minLength = Config.get('minAccountNameLength');

  if (!name) {
    return 'Your name cannot be blank.';
  }
  if (name.length > maxLength) {
    return `Your name needs to be less than ${maxLength} characters.`;
  }
  if (name.length < minLength) {
    return `Your name needs to be greater than ${minLength} characters.`;
  }
  if (!/^[a-z]+$/i.test(name)) {
    return 'Your name may contain only A-Z without spaces or special characters.';
  }
  return false;
};
