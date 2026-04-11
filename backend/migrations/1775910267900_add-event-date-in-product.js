/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumns('submission', {
        event_date: {
            type: 'date',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('submission', [
        'event_date',
    ]);
};
