# EUBFR Projects

Searching for duplicate projects.

## Up docker containers

Requirements:

- Docker
- docker-compose

Run:

```sh
$ docker-compose up -d
```

See running containers:

```sh
$ docker ps
```

Enter docker container with MongoDB:

```sh
$ docker exec -it eubfr-mongo /bin/bash
```

Where `eubfr-mongo` is the name of the given container on your host on docker-compose.yml.

When in the container, run `mongo` to enter [mongo shell](https://docs.mongodb.com/manual/reference/mongo-shell/).

At this point you have a running MongoDB database.

## Scripts

Import all projects to MongoDB, locally, and perform various checks on the data.

## Get dependencies

```sh
$ yarn
```

## Import results.ndjson to Mongo

```sh
$ yarn run import
```

## Check and output results of duplicated budgets

```sh
$ yarn get-same-budget
```

## Check and output results of duplicated budgets and same start date

```sh
$ yarn get-same-budget-start-date
```
