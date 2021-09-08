/*
 * © 2021 Thoughtworks, Inc.
 */


// Override any local .aws/credentials you may have configured, to ensure consistency between local and CI test runs
process.env.AWS_ACCESS_KEY_ID = 'test-id'
process.env.AWS_SECRET_ACCESS_KEY = 'test-key'
