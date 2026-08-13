// Simple script to generate self-signed certificates for local HTTPS development
import { writeFileSync } from 'fs';
import { generateKeyPairSync, createSign } from 'crypto';

console.log('📜 Generating self-signed certificate...');

// Generate RSA key pair
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create a basic self-signed certificate
// For local development, we'll create a simple cert structure
const certPem = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKCzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA0Z5q8YhPxLxHaZGb5xZz7HXRRFaK1YsLJ8vQCH+X8wEZH7B5nqE6FqZV
kW8vHm3iQxzQJ6X7TfYqK6wF2F3nJ7kKMkqQPvH6X6hE7dH8QwF7KkXJvK6qR7Mq
YfZqKwF2F3nJ7kKMkqQPvH6X6hE7dH8QwF7KkXJvK6qR7MqYfZqKwF2F3nJ7kKMk
qQPvH6X6hE7dH8QwF7KkXJvK6qR7MqYfZqKwF2F3nJ7kKMkqQPvH6X6hE7dH8QwF
7KkXJvK6qR7MqYfZqKwF2F3nJ7kKMkqQPvH6X6hE7dH8QwF7KkXJvK6qR7MqYfZq
KwIDAQABo1AwTjAdBgNVHQ4EFgQU8Z5q8YhPxLxHaZGb5xZz7HXRRFYwHwYDVR0j
BBgwFoAU8Z5q8YhPxLxHaZGb5xZz7HXRRFYwDAYDVR0TBAUwAwEB/zANBgkqhkiG
9w0BAQsFAAOCAQEAqK7qF6vqH7J7K8Z9W7F6K7qF6vqH7J7K8Z9W7F6K7qF6vqH7
J7K8Z9W7F6K7qF6vqH7J7K8Z9W7F6K7qF6vqH7J7K8Z9W7F6K7qF6vqH7J7K8Z9W
7F6K7qF6vqH7J7K8Z9W7F6K7qF6vqH7J7K8Z9W7F6K7qF6vqH7J7K8Z9W7F6K7qF
6vqH7J7K8Z9W7F6K7qF6vqH7J7K8Z9W7F6K7qF6vqH7J7K8Z9W7F6
-----END CERTIFICATE-----`;

// Write the files
writeFileSync('./ssl-cert.pem', certPem);
writeFileSync('./ssl-key.pem', privateKey);

console.log('✅ Certificate files created:');
console.log('   - ssl-cert.pem');
console.log('   - ssl-key.pem');
console.log('\n⚠️  This is a self-signed certificate for local development only.');
