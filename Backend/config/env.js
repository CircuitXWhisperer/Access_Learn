import dotenv from 'dotenv';

// Backend scripts run from the Backend directory, so load the workspace environment explicitly.
dotenv.config({ path: new URL('../../.env', import.meta.url) });
