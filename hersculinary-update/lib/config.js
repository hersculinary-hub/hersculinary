// lib/config.js
//
// Site-wide constants that are easy to change in one place.

// Admin's WhatsApp number for the "Pesan via WhatsApp" order button, in
// international format without the leading "+" or "0" (e.g. 0896-7114-5720
// becomes 62896711457200 → 62 + 896711457200... see note below).
//
// To change this number later: replace the digits below with the new number,
// written as 62 followed by the number WITHOUT its leading 0.
// Example: 089671145720 → drop the leading 0 → 89671145720 → prefix with 62
// → 6289671145720
export const ADMIN_WHATSAPP_NUMBER = '6289671145720';
