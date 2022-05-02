import React from 'react'
import { TextField } from '@mui/material';
import QRCode from 'qrcode.react';
import LoadingButton from '@mui/lab/LoadingButton';
import { Auth } from 'aws-amplify';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // login credentials
            username: null,
            password: null,
            // Cognito user object
            user: {},
            // track ui state
            loading: false,
            passwordError: false,
            showConfirmationStep: false,
            code: null,
            verifyCode: null,
            codeError: null
        };
    }

    getCode = async (user) => {
        //let user = await Auth.currentAuthenticatedUser();
        let code = await Auth.setupTOTP(user);
        return code;
    }

    login = async () => {
        const { username, password } = this.state;
        if (!username || !password) {
            return;
        }
        this.setState({ loading: true });
        try {
            const user = await Auth.signIn(username, password);
            let code = null;
            if (user.challengeName === 'MFA_SETUP') {
                // This happens when the MFA method is TOTP
                // The user needs to setup the TOTP before using it
                // More info please check the Enabling MFA part
                code = await Auth.setupTOTP(user);
            }
            this.setState({ loading: false, user, showConfirmationStep: true, code });
        } catch (err) {
            if (err.code === 'UserNotConfirmedException') {
                // The error happens if the user didn't finish the confirmation step when signing up
                // In this case you need to resend the code and confirm the user
                // About how to resend the code and confirm the user, please check the signUp part
            } else if (err.code === 'PasswordResetRequiredException') {
                // The error happens when the password is reset in the Cognito console
                // In this case you need to call forgotPassword to reset the password
                // Please check the Forgot Password part.
            } else if (err.code === 'NotAuthorizedException') {
                // The error happens when the incorrect password is provided
            } else if (err.code === 'UserNotFoundException') {
                // The error happens when the supplied username/email does not exist in the Cognito user pool
            } else {
                console.log(err);
            }
            console.log('error signing in', err);
            this.setState({ loading: false, passwordError: true });
        }
    }

    verify = async () => {
        this.setState({ loading: true });
        const { user, verifyCode } = this.state;

        if (user.challengeName === 'MFA_SETUP') {
            Auth.verifyTotpToken(user, verifyCode)
                .then(() => {
                    // don't forget to set TOTP as the preferred MFA method
                    Auth.setPreferredMFA(user, 'TOTP');
                })
                .catch((err) => {
                    if (err.code === 'EnableSoftwareTokenMFAException') {
                        this.setState({ codeError: true });
                    }
                });
        } else {
            // If MFA is enabled, sign-in should be confirmed with the confirmation code
            await Auth.confirmSignIn(user, verifyCode, 'SOFTWARE_TOKEN_MFA')
                .then((loggedUser) => {
                    this.props.notify('Successfully logged in');
                    window.location = '/home';
                })
                .catch(err => {
                    console.log('Error in verifying MFA', err);
                })
        }
    }

    renderLoginStep = () => {
        return (
            <form className="form">
                <TextField
                    id="login-username"
                    label="username"
                    variant="outlined"
                    required={true}
                    fullWidth={true}
                    onChange={(e) => {
                        const value = e.target.value;
                        this.setState({ username: value });
                    }}
                />
                <br/>
                <TextField
                    id="login-password"
                    label="password"
                    variant="outlined"
                    required={true}
                    type="password"
                    onChange={(e) => {
                        const value = e.target.value;
                        this.setState({ password: value });
                    }}
                    error={this.state.passwordError}
                    helperText={this.state.passwordError && 'Incorrect username or password'}
                />
                <br/>
                <LoadingButton
                    variant="contained"
                    onClick={this.login}
                    loading={this.state.loading}
                >
                    Login
                </LoadingButton>
            </form>
        );
    }

    renderConfirmationStep = () => {
        const { user, code, codeError } = this.state;
        const { username } = user;
        let qrCode;

        if (user.challengeName === 'MFA_SETUP') {
            // Show the QR code to allow user to register/setup MFA
            const str = "otpauth://totp/AWSCognito:"+ username + "?secret=" + code;// + "&issuer=" + issuer;
            qrCode = (
                <div className="center">
                    <p>Scan using Google Authenticator <br/>to generate 2-Step Verification code</p>
                    <QRCode value={str}/>
                    <br/>
                </div>
            )
        }

        const verify = (
            <form className="form">
                <p>Enter 2-Step Verification code from your registered device</p>
                <TextField
                    id="login-verifyCode"
                    label="verify code"
                    variant="outlined"
                    required={true}
                    fullWidth={true}
                    error={codeError}
                    helperText={codeError && 'Incorrect code, please try again'}
                    onChange={(e) => {
                        const value = e.target.value;
                        this.setState({ verifyCode: value });
                    }}
                />
                <br/>
                <LoadingButton
                    variant="contained"
                    onClick={this.verify}
                    loading={this.state.loading}
                >
                    Login
                </LoadingButton>
            </form>
        );

        return (
            <div>
                {qrCode}
                {verify}
            </div>
        );

    }

    render() {
        const { showConfirmationStep } = this.state;
        const loginStep = this.renderLoginStep();
        const confirmationStep = this.renderConfirmationStep()
        return (
            <div className="login">
                <div className="mkcard">
                    { showConfirmationStep ? confirmationStep : loginStep }
                </div>
            </div>
        );
    }
}

export default Login;