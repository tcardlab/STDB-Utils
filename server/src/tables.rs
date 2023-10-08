use spacetimedb::{spacetimedb, Identity, Timestamp};

/***   GLOBAL   ***/
#[spacetimedb(table)]
pub struct Config {
  #[primarykey]
  pub version: u32,
}


#[spacetimedb(table)]
pub struct UserTable {
  #[primarykey]
  pub identity: Identity,

  pub username: Option<String>,
  pub online: bool,
  pub time_login: Timestamp,
  pub time_logout: Option<Timestamp>,
  pub time_register: Timestamp
}

#[spacetimedb(table)]
pub struct ThingTable {
  #[primarykey]
  #[autoinc]
  pub thing_id: u64,

  pub owner: Identity, // cluster index would be cool

  pub content: Option<String>,
  pub status: bool,
  pub time: Timestamp,
}


