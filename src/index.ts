import express from "express";
import { Client } from "pg";

const app = express();
app.use(express.json());

const pgClient = new Client("postgresql://neondb_owner:npg_JFSI5fP3Wuyr@ep-wispy-bird-b445wd1m-pooler.c-6.us-east-2.aws.neon.tech/neondb?uselibpqcompat=true&sslmode=require")

 pgClient.connect();


app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;

    // try {

    //     const insertQuery = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3);`

    //     const response = await pgClient.query(insertQuery, [username, email, password]);

    //     res.json({
    //         message: "You have signed up"
    //     })
    // } catch(e) {
    //     console.log(e);
    //     res.json({
    //         message: "Error while signing up"
    //     })
    // }
    async function insertUserAndAddress(
        username: string,
        email: string,
        password: string,
        city: string,
        country: string,
        street: string,
        pincode: string
    ) {
        try {
            await pgClient.query('BEGIN');

            const insertUserText = `
            INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING id;`;

            const userRes = await pgClient.query(insertUserText, [username, email, password]);
            const userId = userRes.rows[0].id;

            const insertAddressText = `
            INSERT INTO addresses (user_id, city, country, street, pincode)
            VALUES ($1, $2, $3, $4, $5); `;

            await pgClient.query(insertAddressText, [userId, city, country, street, pincode]);

            // Commit transaction
            await pgClient.query('COMMIT');

        }
        catch (err) {
            await pgClient.query('ROLLBACK');
            console.error('Error during transaction, rolled back.', err);
            throw err;
        }
    }
    try {
        await insertUserAndAddress(
            username,
            email,
            password,
            city,
            country,
            street,
            pincode
        );
        res.json({ message: "You have signed up" });
    } catch (err) {
        console.error("Error while signing up.", err);
        res.status(500).json({ message: "Error while signing up" });
    }

})

app.listen(3000)