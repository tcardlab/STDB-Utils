## Dev Server

This is a basic server to run CRUD (Create, Read, Update, and Delete) ops against for each package in their `dev/` directory.

A standard `dev/index.ts` file will usually cover the following:

1. Connection:
  - Establish connection to the Dev-Server

2. Identities:
  - Get and Set Identity

3. Read:
  - Shallow: a list of table data
  - Deep: single value from a row
  - Demonstrate: reactive/live updates

4. Insert:
  - Without reducer event (on Init)
  - With reducer event (triggered reducer, user or timeout)
  - Read: data should update live

5. Update:
  - Update column value of a row

6. Delete:
  - With reducer event (triggered reducer, user or timeout)

Others may involve reactive effects/filters, making HTTP requests, and/or initializing custom cache(s).

(Do I need to test dealing with a table that has no primary key?)
