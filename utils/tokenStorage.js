// A key for storing the token list in localStorage
const LOCAL_STORAGE_KEY = 'solana_dapp_created_tokens';

/**
 * Retrieves the list of created tokens from localStorage.
 * @returns {Array} An array of token data objects.
 */
export const getTokensFromLocalStorage = () => {
  try {
    const items = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return [];
  }
};

/**
 * Saves a new token's data to the list in localStorage.
 * @param {object} tokenData - The token data to save (e.g., { name, symbol, mintAddress }).
 */
export const saveTokenToLocalStorage = (tokenData) => {
  try {
    const tokens = getTokensFromLocalStorage();
    tokens.push(tokenData);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error("Error writing to localStorage", error);
  }
};