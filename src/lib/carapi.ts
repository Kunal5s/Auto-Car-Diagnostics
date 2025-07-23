
'use server';

/**
 * @fileOverview This service for interacting with CarAPI.app has been disabled.
 * All functions related to this service will now throw an error to indicate
 * that they are no longer functional. This change was made to remove dependencies
 * on external paid services and improve application stability.
 */

// Generic function to fetch data from any CarAPI endpoint
export async function fetchCarApiData(endpoint: string, params: Record<string, any> = {}) {
    throw new Error('The CarAPI.app integration has been disabled and is no longer available.');
}
