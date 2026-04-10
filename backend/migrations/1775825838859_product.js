/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('product', {
        id: {
            type: 'uuid',
            notNull: true,
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        campaign_id: {
            type: 'uuid',
            notNull: true,
            references: 'campaign(id)',
        },
        product_name: {
            type: 'text',
            notNull: true,
        },
        description: {
            type: 'text',
            notNull: true,
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
};

exports.down = (pgm) => {
    pgm.dropTable('product');
};
