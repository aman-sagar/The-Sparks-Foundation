const Faker = require('faker');
const mongoose = require('mongoose');
const Customer = require('./models/customer');

const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/sbs";

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seeds = async() => {
    await Customer.deleteMany({});
    for (let i = 0; i < 10; i++) {
        const fName = Faker.name.firstName();
        const lName = Faker.name.lastName();
        const email = Faker.internet.email();
        console.log(email);
        const balance = 1000000;
        const dob = Faker.date.past(10, new Date(2005, 0, 1));
        const mobNo = Math.floor(Math.random() * 1000000000);
        const address = Faker.address.city() + ", " + Faker.address.country();

        const customer = new Customer({
            fName,
            lName,
            email,
            balance,
            dob,
            mobNo,
            address
        });

        await customer.save();

    }
}

seeds().then(() => {
    mongoose.connection.close();
});