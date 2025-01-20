/**
 * This utility function decodes a JWT token to extract its payload
 * JWT tokens are base64 encoded. The payload is the second part of the token
 * Decode the base64 string and parse it as JSON.
 */

export const decodeJWT = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
};