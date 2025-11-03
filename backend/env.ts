const envPath = resolve(__dirname, '@/.env');
dotenv.config({ path: envPath });
console.log(`Environment variables loaded from ${envPath}`);