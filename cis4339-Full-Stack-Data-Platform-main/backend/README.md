# Backend

This implementation is for NodeJS based on [Express](https://expressjs.com/) and [MongoDB](https://www.mongodb.com/) and uses [mongoose](https://mongoosejs.com/) as the ODM.

## Project setup

Install all dependencies.

    npm install

Setup a .env file with the following variables in the backend folder: MONGO_URI and JWT_SECRET

1. Go to this site to generate a JWT_SECRET: <https://jwt.io/>
2. Place the generated JWT_SECRET in the .env file
3. Use the MONGO_URI provided in below, and place it in the .env file as shown below:
4. No need to create a database yourself, I have already attached connection string.


    MONGO_URI=mongodb+srv://admin:cis4339grp32@cis4339grp32.ouvhcpc.mongodb.net/CHW        JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c



After setting up the .env file, please confirm that the .env file is in the backend folder in the right place

![img.png](img.png)

### Compiles and hot-reloads for development

To start up the backend for development run:

    npm start

## Postman Documentation

More details about the API endpoints can be found at <https://documenter.getpostman.com/view/14135534/2sA3BuUnmq>
