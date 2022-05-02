import React from 'react'
import { TextField, Card, Button } from '@mui/material';
import { isPasswordCompliant } from '../helpers/passwordHelper';
import LoadingButton from '@mui/lab/LoadingButton';
import { Auth } from 'aws-amplify';

class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // signup credentials
            username: null,
            password: null,
            email: null,
            phone: null,
            confirmationCode: null,
            // track ui state
            loading: false,
            passwordError: false,
            showConfirmationStep: false,
        };
    }

    /**
     * Signup user with AWS cognito
     * @returns {Promise<void>}
     */
    signup = async () => {
        const { username, password, email, phone } = this.state;
        if (!username || !password) {
            return;
        }
        this.setState({ loading: true });
        try {
            const { user, userConfirmed, userSub } = await Auth.signUp({
                username,
                password,
                attributes: {
                    email,
                    phone_number: phone
                }
            });
            this.setState({ user, showConfirmationStep: !userConfirmed, loading: false });
        } catch (error) {
            console.log('error signing up:', error);
            this.setState({ loading: false });
        }
    }

    /**
     * Confirm Email
     * @returns {Promise<void>}
     */
    confirm = async () => {
        const { username, confirmationCode } = this.state;
        if (!confirmationCode) {
            return;
        }
        this.setState({ loading: true });
        try {
            await Auth.confirmSignUp(username, confirmationCode);

            this.setState({ loading: false });
            window.location = '/login';
        } catch (error) {
            console.log('error confirming sign up', error);
            this.setState({ loading: false });
        }
    }

    renderSignup = () => {
        const { passwordError, username, password, email, phone } = this.state;
        const formIsComplete = !passwordError && username && password && email && phone;
        console.log('formIsComplete', formIsComplete);
        return (
            <form className="form">
                <TextField
                    id="signup-username"
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
                    id="signup-password"
                    label="password"
                    variant="outlined"
                    required={true}
                    type="password"
                    onChange={(e) => {
                        const value = e.target.value;
                        this.setState({ password: value, passwordError: !isPasswordCompliant(value) });
                    }}
                    error={this.state.passwordError}
                    helperText={this.state.passwordError && 'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters'}
                />
                <br/>
                <TextField
                    id="signup-email"
                    label="email"
                    variant="outlined"
                    required={true}
                    fullWidth={true}
                    type="email"
                    onChange={(e) => {
                        const value = e.target.value;
                        this.setState({ email: value });
                    }}
                />
                <br/>
                <TextField
                    id="login-phone"
                    label="phone"
                    placeholder='+91XXXXXXXXXX'
                    variant="outlined"
                    type="phone"
                    required={true}
                    fullWidth={true}
                    onChange={(e) => {
                        const value = e.target.value;
                        this.setState({ phone: value });
                    }}
                />
                <br/>
                <LoadingButton
                    variant="contained"
                    onClick={this.signup}
                    loading={this.state.loading}
                    disabled={!formIsComplete}
                >
                    Signup
                </LoadingButton>
            </form>
        );
    }

    renderConfirmation = () => {
        return (
            <form className="form">
                <TextField
                    id="signup-confirmationCode"
                    label="confirmation code"
                    variant="outlined"
                    required={true}
                    fullWidth={true}
                    onChange={(e) => {
                        const value = e.target.value;
                        this.setState({ confirmationCode: value });
                    }}
                    defaultValue={null}
                />
                <br />
                <LoadingButton
                    variant="contained"
                    onClick={this.confirm}
                    loading={this.state.loading}
                >
                    Confirm
                </LoadingButton>
            </form>
        );
    }

    render() {
        const signupStep = this.renderSignup();
        const confirmationStep = this.renderConfirmation();
        const { showConfirmationStep } = this.state;
        return (
            <div className="signup">
                <div className="mkcard">
                    { showConfirmationStep ? confirmationStep : signupStep }
                </div>
            </div>
        );
    }
}

export default Signup;