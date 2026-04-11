/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.dropColumns('submission', ['campaign_id'], { ifExists: true });
};

exports.down = (pgm) => {
    pgm.addColumns('submission', {
        campaign_id: {
            type: 'uuid',
            notNull: false,
        },
    });
};
