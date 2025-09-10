import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'], // 測試檔路徑
    moduleFileExtensions: ['ts', 'js', 'json'],
};

export default config;
