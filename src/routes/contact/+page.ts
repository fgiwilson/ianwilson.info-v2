// Import safely with optional chaining to handle missing env variables
import { browser } from '$app/environment';
import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

export function load() {
    // Try to get the Turnstile site key, use a placeholder for CI builds
    let siteKey = '';
    
    try {
        // Only attempt to import in browser or when env is available
        if (browser) {
            siteKey = PUBLIC_TURNSTILE_SITE_KEY || '';
        }
    } catch (error) {
        console.warn('Turnstile site key not available:', error);
    }
    
    return {
        siteKey
    };
}