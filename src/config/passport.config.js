import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

import { UsersManager } from '../dao/users.manager.js';
import { createHash, isValidPassword } from '../utils.js';

const localStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;

const cookieExtractor = (req) => {
    return req && req.signedCookies ? req.signedCookies.token : null;
};

const initializePassport = () => {
    passport.use('register', new localStrategy({
        usernameField: 'email',
        passReqToCallback: true,
        session: false
    },
        async (req, username, password, done) => {
            try {
                const { first_name, last_name, age } = req.body;
                if (!first_name || !last_name || !username || !age || !password) {
                    return done(null, false, 'Faltan campos obligatorios');
                }
                const user = await UsersManager.getInstance().getUserByEmail(username);
                if (user) {
                    return done(null, false, 'Ya existe un usuario registrado con este correo electrónico');
                }
                const newUser = await UsersManager.getInstance().createUser({
                    first_name,
                    last_name,
                    email: username,
                    age,
                    password
                });
                return done(null, newUser, 'Usuario registrado con éxito');
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('login', new localStrategy({
        usernameField: 'email',
        passReqToCallback: true,
        session: false
    },
        async (req, username, password, done) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return done(null, false, 'Faltan campos obligatorios');
                }
                const user = await UsersManager.getInstance().getUserByEmail(username);
                if (!user) {
                    return done(null, false, 'Usuario inexistente');
                }
                if (!isValidPassword(password, user)) {
                    return done(null, false, 'Contraseña incorrecta');
                }
                return done(null, user, 'Usuario logueado con éxito');
            } catch (error) {
                return done(error);
            }
        }
    ));


    passport.use('restore', new localStrategy({
        usernameField: 'email',
        passReqToCallback: true,
        session: false
    },
        async (req, username, password, done) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return done(null, false, 'Faltan campos obligatorios');
                }
                const user = await UsersManager.getInstance().getUserByEmail(username);
                if (!user) {
                    return done(null, false, 'Usuario inexistente');
                }
                user.password = createHash(password);
                await user.save();
                return done(null, user, 'Contraseña restaurada con éxito');
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('current', new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: 'myPrivateKey'
    },
        async (jwtPayload, done) => {
            try {
                return done(null, jwtPayload);
            } catch (error) {
                return done(error);
            }
        }
    ));
};

export default initializePassport;