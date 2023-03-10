use crate::fs;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use log::{error, info};
use std::process;

pub fn run_migrations() {
    const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");
    let mut connection = establish_connection();
    if let Err(err) = connection.run_pending_migrations(MIGRATIONS) {
        error!("Failed to run pending migrations: {err}");
        process::exit(1);
    };
    info!("Applied pending database migrations");
}

pub fn establish_connection() -> SqliteConnection {
    let database_url = fs::get_app_base_dir().join("rdmp.db");
    let database_url = database_url.to_str().unwrap_or_else(|| {
        error!("Failed to locate database");
        process::exit(1);
    });
    SqliteConnection::establish(database_url).unwrap_or_else(|err| {
        error!("Failed connecting to {database_url}: {err}");
        process::exit(1);
    })
}
