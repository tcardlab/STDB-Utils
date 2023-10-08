use spacetimedb::{spacetimedb, ReducerContext};

pub mod tables;
use tables::*;



/***   Special Hooks   ***/
#[spacetimedb(init)]
pub fn init() {
    log::info!("Init DB");  // might add timestamp

    // Create our global config table.
    Config::insert(Config { version: 0 })
      .expect("Failed to insert config.");
}

#[spacetimedb(connect)]
pub fn identity_connected(ctx: ReducerContext) {
    if let Some(user) = UserTable::filter_by_identity(&ctx.sender) {
        UserTable::update_by_identity(&ctx.sender, UserTable { 
            online: true,
            time_login: ctx.timestamp,
            ..user
        });
    }
}

#[spacetimedb(disconnect)]
pub fn identity_disconnected(ctx: ReducerContext) {
    if let Some(user) = UserTable::filter_by_identity(&ctx.sender) {
        UserTable::update_by_identity(&ctx.sender, UserTable { 
          online: false,
          time_logout: Some(ctx.timestamp),
          ..user
        });
    }
}



/***   User Reducers   ***/
#[spacetimedb(reducer)]
pub fn create_user(ctx: ReducerContext, username: String) -> Result<(), String> {
    let identity = ctx.sender;

    if UserTable::filter_by_identity(&identity).is_some() {
      let res = "user already exists".to_string();
      log::info!("{}", res);
      return Err(res);
    }

    let name = &username;
    UserTable::insert( UserTable {
      username: Some(name.to_string()),
      identity: ctx.sender,
      online: true,
      time_register: ctx.timestamp,
      time_login: ctx.timestamp,
      time_logout: None
    })
    .expect("Failed to insert player component.");
    log::info!("User created: {}", username);

    Ok(())
}

fn validate_name(name: String) -> Result<String, String> {
    if name.is_empty() {
      Err("Names must not be empty".to_string())
    } else {
      Ok(name)
    }
}

#[spacetimedb(reducer)]
pub fn set_name(ctx: ReducerContext, name: String) -> Result<(), String> {
    let name = validate_name(name)?;
    if let Some(user) = UserTable::filter_by_identity(&ctx.sender) {
        UserTable::update_by_identity(&ctx.sender, UserTable { username: Some(name), ..user });
        Ok(())
    } else {
        Err("Cannot set name for unknown user".to_string())
    }
}



/***   Thing Reducers   ***/
#[spacetimedb(reducer)]
pub fn create_thing(ctx: ReducerContext, content_arg: String) -> Result<(), String> {

    ThingTable::insert( ThingTable {
      thing_id: 0, // autoinc
      owner: ctx.sender,
      status: true,
      time: ctx.timestamp,
      content: Some(content_arg.to_owned())
    })
    .expect("Failed to insert player component.");
    log::info!("Thing created: {}", content_arg);

    Ok(())
}

#[spacetimedb(reducer)]
pub fn delete_thing(id: u64) {
    ThingTable::delete_by_thing_id(&id);
}

#[spacetimedb(reducer)]
pub fn update_thing_content(id: u64, new_content: String) {
    let mut item = ThingTable::filter_by_thing_id(&id)
        .expect("Failed to find thing");

    item.content = Some(new_content);
    ThingTable::update_by_thing_id(&id,  item);
}

#[spacetimedb(reducer)]
pub fn toggle_thing_status(id: u64) {
    let mut item = ThingTable::filter_by_thing_id(&id)
      .expect("Failed to find thing");

    item.status = !item.status;
    ThingTable::update_by_thing_id(&id,  item);
}
