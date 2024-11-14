const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const clientId = '128280';
const clientSecret = 'acf91c4c2644e130126e61725deb68a8b11657e7';
const redirectUri = 'http://localhost:3000/callback';

let accessToken = '';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=read,activity:read_all,profile:read_all`;
    res.send(`<a href="${authUrl}">Log in with Strava</a>`);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Authorization code not found.');
    }

    const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code'
    });

    accessToken = response.data.access_token;
    const athlete = response.data.athlete;

    res.send(`
            <h1>Logged in as ${athlete.firstname} ${athlete.lastname}</h1>
            <p>Access Token: ${accessToken}</p>
            <p><a href="/activities">View My Activities</a></p>
        `);
});
function helloWorld() {
    console.log('Hiiiiiii');
}
helloWorld()
app.get('/activities', async (req, res) => {
    if (!accessToken) {
        return res.status(401).send('Not authenticated. Please log in first.');
    }

    const activitiesResponse = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const activities = activitiesResponse.data;
    res.render('activities', { activities });

});

app.get('/refresh-activities', async (req, res) => {
    if (!accessToken) {
        return res.status(401).send('Not authenticated. Please log in first.');
    }

    const activitiesResponse = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const activities = activitiesResponse.data;
    res.render('activities', { activities });

});

const port = 3000;
app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
