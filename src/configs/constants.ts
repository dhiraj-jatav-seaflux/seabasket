export const Constants: Readonly<{ [key: string]: any }> = {
  JOB_CONFIG: {
    failed: {
      age: 24 * 3600,
    },
    completed: {
      age: 1 * 3600,
      count: 100,
    },
  },

  ENVIRONMENTS: ["development", "stage", "production", "test"],

  JWT_TOKEN_VERSION: "v1", // Just increase to invalidate all sessions.

  PAGER: {
    page: 1,
    limit: 2000,
  },

  FROM_EMAIL: "no-reply@example.com",

  BCRYPT_SALT_ROUND: 10,

  FIRST_NAME_MAX_LENGTH: 255,

  LAST_NAME_MAX_LENGTH: 255,

  EMAIL_MAX_LENGTH: 255,

  COMPANY_NAME_MAX_LENGTH: 255,

  VERIFICATION_CODE_MAX_LENGTH: 6,

  PASSWORD_MAX_LENGTH: 255,

  PASSWORD_MIN_LENGTH: 6,

  RESET_PASS_EXPIRY: 900,
};
