# `hub-backend`

The elunic TypeScript starter

- [`hub-backend`](#hub-backend)
  - [Usage](#usage)
  - [npm scripts](#npm-scripts)
  - [`.env` configuration](#env-configuration)
  - [Commitlint](#commitlint)
  - [Docker shell](#docker-shell)
    - [MySQL](#mysql)
    - [phpMyAdmin](#phpmyadmin)
    - [Notes](#notes)

## Usage

When adapting for your own project, don't forget to:

- change the image and host for the "app" service name in
  `docker/shell/docker-compose.yml`, or you WILL have issues with your Docker container

## npm scripts

This is not a complete list. Check the `package.json` to see the complete list.

**Note** see [Docker shell](#docker-shell) for the Docker shell-related scripts

- `npm run dev`: watch mode
- `npm run dev:debug`: watch mode with `--inspect-brk`
- `npm run check`: run linting and formatting checks
- `npm run fix`: run linting and formatting checks and fix errors automatically, where possible
- `npm run test`: run tests in watch mode
- `npm run test:debug`: run tests in watch mode with `--inspect-brk`
- `npm run test:once`: run tests once with coverage (CI)
- `npm run e2e`: run e2e tests in watch mode
- `npm run e2e:once`: run e2e tests in CI mode

## `.env` configuration

The configuration mechanism will use a `.env` file placed in the project root,
if it exists.

**Note**: **never** commit a `.env` file.

## Commitlint

A commitlint configuration file is provided, but not enabled by default in accordance with the elunic defaults.

To enable commitlint, add the appropriate hook to `.huskyrc.json`:
```json
{
  "hooks": {
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}
```

## Docker shell

To drop into a shell inside a Docker container with Node installed, the required services (MySQL) already started, run:

`npm run shell`

Inside the shell, you will be in the project root,
and all `npm` scripts (such as `npm run dev`) will be available.

### MySQL

Also, two MySQL databases are available (`db` and `db-testing`). Environment variables for the access are set/passed
automatically to the main `app` container. When inside the shell (when the `docker-compose` setup is `up`),

### phpMyAdmin

`phpMyAdmin` is reachable through port `8079`.

### Notes

Also available are:

- `npm run shell:build` builds the `sia` container in which the shell will be available.
  - This **must** be run once before `npm run shell`, also every time `Dockerfile.dev` has been updated
- `npm run shell:stop` when you exit the shell with `CTRL+C`, the `docker-compose` setup
  should be torn down automatically. If anything goes wrong (network not deleted, container still running and taking up ports, etc.), you can run this.
  It basically executes `docker-compose down`.
- `npm run shell:join` joins the existing shell (if it is up). Useful to have more than one
  shell inside the container if one executing `npm run dev` (for example)
