# Node Typescript Functional Boilerplate

![Node.js](https://img.shields.io/badge/node-22.18.0-brightgreen.svg)
![Yarn](https://img.shields.io/badge/yarn-1.22.x-blue.svg)
![Postgres](https://img.shields.io/badge/postgres-14.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Build](https://img.shields.io/github/actions/workflow/status/dhruvkapadi/dhruv-learning/node-ts-functional-w-jest/ci.yml?branch=main)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)

> A boilerplate for building scalable, testable Node.js applications with TypeScript, functional programming, and Vitest.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [DB Setup](#db-setup)
- [Start Development Server](#start-development-server)
- [Create a Build](#create-a-build)
- [Postman Documentation](#postman-documentation)
- [Running Tests](#running-tests)
- [License](#license)

---

## Prerequisites

| **Package** | **Version** |
| ----------- | ----------- |
| Node        | 22.18.0     |
| Yarn        | 1.22.x      |
| Postgres    | 14.0        |
| Liquibase   | 4.17.0      |

---

## Development Environment Setup

### Set required Node Version

```sh
nvm use
```

### Install dependencies

```sh
yarn install # to install dependencies
```

### ENV Update

```sh
cp .env.example .env  # to create .env file
```

- Place required values in `.env`

---

## DB Setup

- Create new DB Application manually.

```sh
cp liquibase.properties.sample liquibase.properties
```

- Update `liquibase.properties` file with DB credentials
- Run migrations for your local DB using:

```sh
yarn liquibase
```

---

## Start Development Server

```sh
yarn dev # hot reloading
```

```sh
yarn start # without hot reloading
```

---

## Create a Build

```sh
yarn build # output will be in the dist folder
```

---

## Postman Documentation

- You can find `sf-node-functional-boilerplate.postman_collection.json` at the root level of the project directory. Just import it in Postman to start documenting.

---

## Running Tests

- Create a `.env.test` file for test environment variables:

```sh
cp .env.example .env.test
```

- Run tests using:

```sh
yarn test
```

---

## License

This project is licensed under the MIT License.