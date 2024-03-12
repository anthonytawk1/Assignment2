import mongoose from 'mongoose';
import config  from '../configs/config';

async function connectToTheDatabase() {
    try{
        await mongoose.connect(config.database.connectionString);
        console.log("Database Connected and Running");
    }catch(error){
        console.log("Error connecting to the database:", error);
        throw error;
    }
}

export { connectToTheDatabase };