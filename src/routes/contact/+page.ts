import {PUBLIC_TURNSTILE_SITE_KEY} from '$env/static/public';

export function load() {
    console.log('Turnstile Site Key:', PUBLIC_TURNSTILE_SITE_KEY);
    return {
        siteKey: PUBLIC_TURNSTILE_SITE_KEY
    };
}