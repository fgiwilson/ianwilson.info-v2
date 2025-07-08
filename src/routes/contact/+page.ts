// Import the public environment variable safely
import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

export function load() {
    // Access the environment variable directly
    // In production, this will be the value from the server environment
    // In development, this will be from your .env file
    // In CI without the variable, it will be undefined but won't crash
    const siteKey = PUBLIC_TURNSTILE_SITE_KEY || '';
    
    return {
        siteKey
    };
}