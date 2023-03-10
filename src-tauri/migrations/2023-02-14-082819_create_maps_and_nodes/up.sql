CREATE TABLE IF NOT EXISTS maps (
    uuid VARCHAR NOT NULL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
    uuid VARCHAR NOT NULL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    node_type VARCHAR NOT NULL,
    node_order INTEGER NOT NULL,
    done BOOLEAN NOT NULL,
    skip BOOLEAN NOT NULL,
    details VARCHAR,
    parent_node VARCHAR,
    roadmap_uuid VARCHAR NOT NULL,
    FOREIGN KEY (roadmap_uuid) REFERENCES maps (uuid) ON DELETE CASCADE
);
