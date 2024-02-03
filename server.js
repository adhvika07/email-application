const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


const app = express();
app.listen(3000,() => {
    console.log('Server is running http://localhost:3000');
})

app.get('/profile', (req, res) => {
    res.sendFile('/Users/adhvikaiyer/Documents/email app final/profile.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const db = new sqlite3.Database('emails.db')
db.run(`
    CREATE TABLE IF NOT EXISTS emails (
        timestamp TEXT PRIMARY KEY,
        to_email TEXT,
        subject TEXT,
        message TEXT
    )
`);

app.get('/login', (req, res) => {
    res.sendFile('/Users/adhvikaiyer/Documents/email app final/login.html');
});
app.post('/login',async(req,res)=>{
    const {username,password} = req.body
    if(username == 'a' && password == 'a'){
        res.redirect('profile')
    }
    else
        res.redirect('login')
})

app.post('/send', async (req, res) => {
    const { to, subject, text } = req.body;
    console.log(req.body);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "iyeradhvika@gmail.com",
        pass: "lxku tvvk xphy ipqg",
      },
    });
    const mailOptions = {
      from: 'iyeradhvika@gmail.com',
      to,
      subject,
      text,
    };

    try {
        await transporter.sendMail(mailOptions);
        db.run(
          "INSERT INTO emails ( timestamp, to_email, subject, message) VALUES (datetime('now', 'localtime'),?,?,?)",
          [to, subject, text],
          (err) => {
              if (err) {
                  return res.status(500).send(err.toString());
              }})
        console.log('Email sent successfully!');
        res.redirect('profile')
    } catch (error) {
        console.error(error);
        console.log('Error sending email');
    }
});

app.get('/getEmails',(req,res) => {
  db.all('SELECT * FROM emails', (err, rows) => {
    if (err) {
        return res.status(500).send(err.toString());
    }
    else{
        res.json(rows);
    }
})})

app.get('/delete/:id',(req,res)=>{
    const id = req.params.id
    try {
        db.run("DELETE FROM emails where timestamp = ?",id)
        console.log("Deleted Successfully")
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
    }
})