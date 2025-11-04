# Repository Guidelines

## Project Structure & Module Organization
- `app.ts` bootstraps Express and ties Redis and router wiring.
- `src/controllers/` implement request handlers; `src/routers/` map HTTP routes; `src/middlewares/` and `src/utils/` host shared logic.
- `src/models/`, `src/migrations/`, `src/seeders/` follow Sequelize conventions for database lifecycle.
- `config/` stores TypeScript configs compiled into `dist/config` after build; environment samples live in `.env.example`.
- Build artifacts and coverage live in `dist/` and `coverage/`; keep `src/images/` as the source for static assets copied during build.

## Build, Test, and Development Commands
- `npm run dev`: run `nodemon app.ts` for hot reload while iterating.
- `npm run build`: compile TypeScript via `tsc` and copy images into `dist/`.
- `npm start`: launch the compiled service from `dist/app.js`.
- `npm test`: execute Jest with coverage; results stored under `coverage/`.
- `npm run migrate` / `npm run migrate:undo` / `npm run seed`: drive Sequelize CLI against the built config in `dist/config/config.js`.

## Coding Style & Naming Conventions
- Source is TypeScript; keep imports using double quotes and terminate statements with semicolons, matching `src/controllers/accountController.ts`.
- Prefer camelCase for functions and variables, PascalCase for classes and Sequelize models, and suffix files by role (e.g. `cartController.ts`, `user.service.ts`).
- Maintain the existing indentation from controllers (two spaces inside blocks) and run `npx tsc` before committing to catch type regressions.

## Testing Guidelines
- Place unit and integration specs under `src/tests/`; name them `<feature>.spec.ts` to align with Jest discovery.
- Use Supertest for HTTP flows; reset mock Redis connections inside `beforeEach`.
- Always run `npm test` before pushing and verify `coverage/lcov-report` to monitor coverage changes.

## Commit & Pull Request Guidelines
- Follow the existing `[YYYY-MM-DD]-short action` prefix in commit subjects (`git log` shows recent examples); keep the rest sentence-cased and imperative.
- Each pull request should include a change summary, impacted endpoints or jobs, database migration notes, linked tickets, and screenshots or curl examples when APIs change.
- Mention required `.env` keys and confirm migrations ran locally by referencing the exact `npm run migrate` command.

## Security & Configuration Tips
- Never commit `.env`; mirror new keys into `.env.example` with safe defaults.
- Ensure Redis and database connection settings remain environment-driven before enabling new features.
