const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

// Set the server to listen on a public IP
const server = app.listen(port, '0.0.0.0', () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(`Server is running on http://${host}:${port}`);
});

app.use(express.json());

// Password validation function
function validatePassword(password) {
    // Password must be at least 8 characters long
    if (password.length < 8) {
        return false;
    }
    // Password must contain at least one number, one uppercase letter, and one special character
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    return hasNumber && hasUppercase && hasSpecial;
}

// Email validation function
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

app.get('/', (req, res) => {
    res.json({ message: 'Please provide a valid endpoint', status: 'Failed' });
});

app.post('/api/v1/register', (req, res) => {
    if (req.method === 'GET') {
        return res.status(400).json({ message: 'Please use POST method' });
    }
    
    const { email, password, username, agreetotos } = req.body;

    try {
        if (!email || !password || !username) {
            throw new Error('Please provide all required fields!');
        }
        if (typeof agreetotos !== 'boolean') {
            throw new Error('Invalid API call, please check docs.');
        } else if (agreetotos !== true) {
            throw new Error('User must agree to the terms of service.');
        }
        if (!validatePassword(password)) {
            throw new Error('Password must be at least 8 characters long, contain at least one number, one uppercase letter, and one special character.');
        }
        if (!validateEmail(email)) {
            throw new Error('Please provide a valid email address.');
        }

        // Check if email already exists in the database
        const dbData = fs.readFileSync('db.yaml', 'utf8');
        const dbEntries = dbData.split('\n');
        for (const entry of dbEntries) {
            if (entry) {
                const userData = JSON.parse(entry);
                if (userData.email === email) {
                    throw new Error('Email in use! Please provide a different email address.');
                }
            }
        }

        const data = {
            email,
            password,
            username,
            agreetotos
        };
        fs.appendFile('db.yaml', JSON.stringify(data) + '\n', (err) => {
            if (err) {
                throw new Error('Error writing to database');
            } else {
                console.log('Successfully appended data to the database.');
                res.json({ message: 'User registered successfully', status: 'Success' });
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message, status: 'Failed' });
    }
});
