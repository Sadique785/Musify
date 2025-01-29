// src/services/config.js

import { getConfig } from "../config";

class UrlConfig {
    static instance = null;
    
    constructor() {
        if (UrlConfig.instance) {
            return UrlConfig.instance;
        }
        
        this.backendUrl = this.initializeBackendUrl();
        UrlConfig.instance = this;
    }
    
    initializeBackendUrl() {
        // Current implementation using getConfig
        const { backendUrl } = getConfig();
        return backendUrl;
        
        // Previous implementation using Vite env
        // return import.meta.env.VITE_BACKEND_URL;
        
        // Future implementations can be easily added here
    }
    
    getBackendUrl() {
        return this.backendUrl;
    }
}

// Export a singleton instance
export const urlConfig = new UrlConfig();

// Usage example:
export const getBackendUrl = () => urlConfig.getBackendUrl();