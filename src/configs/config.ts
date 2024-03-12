import dotenv from 'dotenv';

dotenv.config();

export interface ServerConfig {
    port: number;
}

export interface DatabaseConfig {
    connectionString: string;
}

export interface ModelNames {
    user: 'User';
    complaint: 'Complaint',
    otp: 'Otp'
}

export interface JwtConfig {
    accessToken: string | undefined;
}

export interface AuthConfig {
    passwordMaxAttempts: number;
    maxOtpRequests: number;
    maxOtpAttempts: number;
}

export interface AppConfig {
    server: ServerConfig;
    database: DatabaseConfig;
    modelNames: ModelNames;
    jwt: JwtConfig;
    auth: AuthConfig;

}

const config: AppConfig = {
    server: {
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    },
    database: {
        connectionString: process.env.DB_CONNECTION_STRING as string,
    },
    modelNames: {
        user: 'User',
        complaint: 'Complaint',
        otp: 'Otp'
    },
    jwt: {
        accessToken: process.env.JWT_ACCESS_SECRET,
    },
    auth: {
        passwordMaxAttempts: process.env.PASSWORD_MAX_ATTEMPTS ? parseInt(process.env.PASSWORD_MAX_ATTEMPTS, 10) : 10,
        maxOtpRequests: process.env.MAX_OTP_REQUESTS ? parseInt(process.env.MAX_OTP_REQUESTS, 10) : 10,
        maxOtpAttempts: process.env.MAX_OTP_ATTEMPTS ? parseInt(process.env.MAX_OTP_ATTEMPTS, 10) : 10,
    }
};

export default config;
