if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const Customer = require('./models/customer');
const Transaction = require('./models/transaction')

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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



app.get('/', (req, res) => {
    res.render('home');
});

app.get('/customers', async(req, res) => {
    const customers = await Customer.find();
    res.render('customers', { customers });
})

app.get('/customers/:customerid', async(req, res) => {
    const { customerid } = req.params;
    const customer = await Customer.findById(customerid);
    res.render('showCustomer', { customer });
})

app.get('/fundstransfer/:senderid', async(req, res) => {
    const { senderid } = req.params;
    const sender = await Customer.findById(senderid);
    const customers = await Customer.find({ _id: { $nin: [sender._id] } });
    res.render('transferScreen', { sender, customers });
})

app.post('/fundstransfer/:senderid', async(req, res) => {
    const senderid = req.params.senderid;
    let transferamt = req.body.transferamt;
    const transferto = req.body.transferto;
    const sender = await Customer.findById(senderid);
    const reciever = await Customer.findById(transferto);
    transferamt = Number(transferamt);

    if (transferamt > sender.balance) {
        return res.redirect(`/fundstransfer/${sender._id}`);
    }

    let senderbal = sender.balance - transferamt;
    let recieverbal = reciever.balance + transferamt;
    sender.balance = senderbal;
    reciever.balance = recieverbal;
    const date = new Date();
    const transaction = new Transaction({
        transferamt,
        sender,
        reciever,
        date
    });
    await transaction.save();
    sender.transactions.unshift(transaction);
    reciever.transactions.unshift(transaction);
    await sender.save();
    await reciever.save();
    res.render('reciept', { transaction, sender, reciever });
})

app.get('/transactions', async(req, res) => {
    const transactions = await Transaction.paginate({}, {
        page: req.query.page || 1,
        limit: 10,
        populate: [{ path: 'sender' }, { path: 'reciever' }],
        sort: { createdAt: -1 }
    });
    res.render('transactions', { transactions });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Active on port 3000");
});