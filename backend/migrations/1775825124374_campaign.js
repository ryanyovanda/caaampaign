/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createType('campaign_status', ['draft', 'published']);

    pgm.createTable('campaign', {
        id: {
            type: 'uuid',
            notNull: true,
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        campaign_name: {
            type: 'text',
            notNull: true,
        },
        slug: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        description: {
            type: 'text',
            notNull: true,
            check: "slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'",
        },
        status: {
            type: 'campaign_status',
            notNull: true,
            default: 'draft',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.createIndex('campaign', 'slug');
};

exports.down = (pgm) => {
    pgm.dropIndex('campaign', 'slug');
    pgm.dropTable('campaign');
    pgm.dropType('campaign_status');
};
