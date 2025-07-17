
'use server';

/**
 * @fileOverview A service for interacting with the CarAPI.app.
 * Handles authentication and data fetching.
 */

import axios from 'axios';

const API_BASE = "https://carapi.app/api";
let jwt: string | null = null;
let jwtExpiry: number | null = null;

// Function to get a valid JWT. It will fetch a new one if the current one is expired or doesn't exist.
async function getJWT(): Promise<string> {
    if (jwt && jwtExpiry && Date.now() < jwtExpiry) {
        return jwt;
    }

    if (!process.env.CAR_API_TOKEN || !process.env.CAR_API_SECRET) {
        throw new Error("Car API credentials are not set in environment variables.");
    }

    try {
        const resp = await axios.post(`${API_BASE}/auth/login`, {
            api_token: process.env.CAR_API_TOKEN,
            api_secret: process.env.CAR_API_SECRET
        });
        jwt = resp.data.token;
        // The token is valid for 24 hours. Set expiry to 23.5 hours to be safe.
        jwtExpiry = Date.now() + 23.5 * 60 * 60 * 1000; 
        return jwt;
    } catch (error) {
        console.error("Failed to authenticate with CarAPI.app", error);
        throw new Error("Could not authenticate with the vehicle data provider.");
    }
}

// Generic function to fetch data from any CarAPI endpoint
export async function fetchCarApiData(endpoint: string, params: Record<string, any> = {}) {
    const token = await getJWT();
    try {
        const resp = await axios.get(`${API_BASE}/${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
            params
        });
        return resp.data;
    } catch (error: any) {
        console.error(`Failed to fetch data from CarAPI.app endpoint: ${endpoint}`, error.response?.data || error.message);
        // Provide a more user-friendly error message
        if (error.response && error.response.status === 404) {
             throw new Error(`The requested resource was not found for endpoint: ${endpoint}.`);
        }
        throw new Error(`Failed to retrieve data from endpoint: ${endpoint}.`);
    }
}
