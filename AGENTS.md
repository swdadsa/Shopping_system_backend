# Repository Guidelines

## Project Structure & Module Organization
- Core runtime entry at `app.ts`; compiled output lives in `dist/`.
- Domain logic stays under `src/controllers`, `src/models`, `src/routers`, and supporting helpers in `src/utils`.
- Sequelize migrations and seeders are in `src/migrations` and `src/seeders`; they rely on build-time configs in `config/` and `dist/config/`.
- Static assets are served from `src/images`; Jest suites live in `src/tests` alongside shared test bootstrapping in `testServer.ts`.
- `.env` and `.env.example` define environment keys; keep sensitive values local and document new ones in the example file.

## Build, Test, and Development Commands
- `npm run dev` starts the TypeScript server via Nodemon for iterative API work.
- `npm run build` compiles with `tsc` and copies images into `dist/src/images`.
- `npm start` executes the compiled server from `dist/app.js`; run after every build before packaging.
- `npm test` runs Jest through `ts-jest`, emitting coverage reports into `coverage/`.
- Database lifecycle: `npm run migrate`, `npm run migrate:undo`, `npm run seed`, and `npm run seed:undo` target the generated config in `dist/config/config.js`.

## Coding Style & Naming Conventions
- Stick with TypeScript modules, double-quoted imports, and 4-space indentation as used across controllers.
- Employ PascalCase for classes/model definitions and camelCase for functions, variables, and route handlers.
- Keep response helpers in `src/response`; reuse shared logic from `src/utils` rather than reimplementing in controllers.
- Avoid committing build artifacts outside `dist/`; keep DTOs and validation schemas colocated with their feature modules.

## Testing Guidelines
- Place new Jest specs in `src/tests` and name them `<feature>.test.ts` to align with `route.test.ts`.
- Use Supertest with `testServer.ts` for HTTP assertions; mock external integrations like Redis, payment, or SMTP where possible.
- Maintain meaningful coverage; investigate drops reported in `npm test` before pushing.
- Remove transient coverage artifacts or logs before committing.

## Commit & Pull Request Guidelines
- Follow the existing subject style: `[YYYY-MM-DD]-short description` (example: `[2025-09-10]-route unit test added`).
- Group related changes so each commit builds and passes tests; rerun `npm run build` when touching types or migrations.
- Pull requests should link Jira/issues, outline behavior changes, note manual test results, and attach screenshots or API samples when endpoints shift.
- Call out schema migrations and new env vars in the PR body so ops can stage them safely.

## Security & Configuration Tips
- Never commit secrets. Start from `.env.example`, add new keys there, and load them with `dotenv`.
- Confirm `initRedis` starts cleanly in `app.ts` when introducing cache-dependent features.
- Revisit Helmet and CORS settings before exposing new routes or static directories.
- Audit third-party packages for license and security posture before merging.
