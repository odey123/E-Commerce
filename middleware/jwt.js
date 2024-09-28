const {expressjwt} = require('express-jwt');

function authjwt() {
    const secret = process.env.secret
    const api = process.env.API_URL;
    return expressjwt({
        secret: secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/api\/v1\/products(.*)/ ,methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ ,methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}

async function isRevoked(req, token) {
    
        if (!token.payload.isAdmin) {
            console.log('user is not an admin')
            return (true); // User is not an admin, revoke the token
        }
         console.log('user is an admin');
         return false; // Token is valid

}



module.exports = authjwt;
