import { config } from 'dotenv';

// Explicitly load environment variables from .env file for local development.
// This script is called by the `dev` command in package.json.
config({ path: '.env' });