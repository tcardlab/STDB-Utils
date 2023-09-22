## @STDB-Utils/Hooks

A dep array that enables you to run a single callback against multiple tables with ease. You probably shouldn't have too much redundant schema between tables to make sharing callbacks in this way worth it, but its here all the same.

```ts
  onUpdate((user, oldUser, reducerEvent) => {
    if (user?.username !== oldUser?.username) {
      console.log(`User ${oldUser?.username} renamed to ${user?.username}.`);
    }
  }, [UserComp])

  onInsert((user, oldUser, reducerEvent) => {
    if (!reducerEvent) return // ignore client population inserts
    console.log(`New User ${user.username} created.`);
  }, [UserComp])
```