/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumns('campaign', {
        background_image: {
            type: 'text',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('campaign', [
        'background_image',
    ]);
};
