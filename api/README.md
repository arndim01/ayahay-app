## Description

API for Ayahay Booking Platform

## Installation

1. Install dependencies
```bash
$ yarn install
```
2. Install PostgreSQL
3. Create a `.env` file in the root directory
4. Define environment variables in the `.env` file
```
DATABASE_URL=postgresql://username:password@localhost:5432/ayahay?schema=ayahay
WEB_URL=http://localhost:3000
```
5. Initialize the database
```bash
$ prisma migrate dev
```


## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Making changes to the database schema

1. Update the `prisma.schema` file in the `prisma` directory.
2. Save the changes to the DB by running a migration 
```bash
$ yarn run db:migrate-dev
```

## Resetting the data in the DB

1. Run the reset
```bash
$ yarn run db:reset-dev
```
 