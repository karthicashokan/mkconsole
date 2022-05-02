import React from "react";
import './App.css';
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import '@aws-amplify/ui-react/styles.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button, Stack }  from '@mui/material';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Logout from './components/Logout';

Amplify.configure(awsconfig);

const theme = createTheme({
    palette: {
        primary: {
            main: '#7e64ed'
        }
    }
});

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            isUserLoggedIn: false,
            notificationMessage: null,
            user: null
        };
        this.headerMenuItems = [];
    }

    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>}
     */
    isUserLoggedIn = async () => {
        try {
            const user = await Auth.currentAuthenticatedUser();
            console.log('user', user);
            this.setState({ user });
            return true;
        } catch {
            return false;
        }
    }

    componentDidMount() {
        this.isUserLoggedIn()
            .then(value => {
                this.setState({ isUserLoggedIn: value });
            });
    }

    /**
     * Updated notification bar message
     * @param notificationMessage
     */
    notify = (notificationMessage) => {
        this.setState({ notificationMessage });
        setTimeout(() => {
            this.setState({ notificationMessage: null });
        }, 3000);
    }

    render() {
        const { isUserLoggedIn, notificationMessage } = this.state;
        return (
            <ThemeProvider theme={theme}>
                <Router>
                    <div className="App">
                        <div className="header">
                            <div className="logo">METAKEEP</div>
                            <div className="nav">
                                <Stack direction="row" spacing={2}>
                                    <Button key="home" href="/home">Home</Button>
                                    {isUserLoggedIn && <Button key="logout" href="/logout">Logout</Button>}
                                    {!isUserLoggedIn && <Button key="login" href="/login">Login</Button>}
                                    {!isUserLoggedIn && <Button key="signup" href="/signup">Signup</Button>}
                                </Stack>
                            </div>
                        </div>
                        {notificationMessage && <div className="notification-message">{notificationMessage}</div>}
                        <div className="app-content">
                            <Routes>
                                <Route exact path="/home" element={<Home isUserLoggedIn={isUserLoggedIn} user={this.state.user} notify={this.notify}/>}/>
                                <Route exact path="/login" element={<Login notify={this.notify} />}/>
                                <Route exact path="/logout" element={<Logout notify={this.notify} />}/>
                                <Route exact path="/signup" element={<Signup notify={this.notify} />}/>
                            </Routes>
                        </div>
                    </div>
                </Router>
            </ThemeProvider>
        );
    }
}

export default App;
