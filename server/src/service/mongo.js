const mongoose = require('mongoose');

const MONGO_URL = "mongodb+srv://ledieptri1:FO0z1aDlYvp1OEF2@cluster0.k33ax3t.mongodb.net/?retryWrites=true&w=majority"
mongoose.connection.once('open', () => {
    console.log('MongoDB connection  successfully!')
})

mongoose.connection.on('error', (err) => {
    console.log(err)
})

async function mongooseConnect(){
    await mongoose.connect(MONGO_URL)
}

async function mongooseDisconnect(){
    await mongoose.disconnect()
}

module.exports = {
    mongooseConnect,
    mongooseDisconnect,
}