const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stateSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    state: String,
    stopped: Boolean,
    engineVerison: String,
    environment: Schema.Types.Mixed,
    definitions: [Schema.Types.Mixed], 
});

const State = mongoose.model('State', stateSchema);
module.exports = State;