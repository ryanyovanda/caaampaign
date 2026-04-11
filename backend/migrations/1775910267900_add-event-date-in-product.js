/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumns('product', {
        event_date: {
            type: 'date',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('product', [
        'event_date',
    ]);
};
