/**
 * This utility function decodes a JWT token to extract its payload
 * JWT tokens are base64 encoded. The payload is the second part of the token
 * Decode the base64 string and parse it as JSON.
 */

export const decodeJWT = (token) => {
    try {
      // Split the token to get the payload part (second part)
      const base64Url = token.split(".")[1];
  
      // Replace invalid characters for Base64 decoding
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  
      // Decode Base64 string to JSON
      const jsonPayload = atob(base64);
  
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error("Failed to decode JWT token");
    }
};
  
