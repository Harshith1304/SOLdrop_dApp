/**
 * Validates the token creation data.
 * @param {object} data - An object with { name, symbol, supply, decimals, image }.
 * @returns {{isValid: boolean, message: string}} - An object indicating if the data is valid and an error message if not.
 */
export const sanitizeTokenData = (data) => {
  if (!data.name || data.name.trim() === '') {
    return { isValid: false, message: 'Token Name is required.' };
  }
  if (!data.symbol || data.symbol.trim() === '') {
    return { isValid: false, message: 'Token Symbol is required.' };
  }
  if (isNaN(data.decimals) || data.decimals < 0 || data.decimals > 18) {
    return { isValid: false, message: 'Decimals must be a number between 0 and 18.' };
  }
  const supply = Number(data.supply);
  if (isNaN(supply) || supply <= 0) {
    return { isValid: false, message: 'Supply must be a positive number.' };
  }
  if (!data.image) {
    return { isValid: false, message: 'A token image is required.' };
  }

  return { isValid: true, message: 'Data is valid.' };
};