# EUBFR Projects

Import all projects to MongoDB, localy, and perform various checks on the data.

## Get dependencies

```sh
$ yarn
```
or

```sh
$ npm install
```

## Import results.ndjson to Mongo

```sh
$ node import.js
```

## Check and outpout results of duplicated budgets

```sh
$ node get-same-budget.js
```

## Check and outpout results of duplicated budgets and same start date

```sh
$ node get-same-budget-start-date.js