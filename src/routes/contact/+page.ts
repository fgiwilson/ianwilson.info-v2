// Import safely with optional chaining to handle missing env variables
import { browser } from '$app/environment';

export function load() {
    // Try to get the Turnstile site key, use a placeholder for CI builds
    let siteKey = '';
    
    try {
        // Only attempt to import in browser or when env is available
        if (browser) {
            const env = import.meta.env;
            siteKey = env.PUBLIC_TURNSTILE_SITE_KEY || '';
        }
    } catch (error) {
        console.warn('Turnstile site key not available:', error);
    }
    
    return {
        siteKey
    };
}