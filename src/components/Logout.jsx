import React from 'react'
import { Auth } from 'aws-amplify';
import { Typography } from '@mui/material';

class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '...'
        };
    }

    componentDidMount() {
        // Step 1: Call logout
        this.logout()
            .then(()=>{
                // Step 2: Set message
                this.setState({content: 'Successfully logged out'});
                // Step 3: Redirect to login
                setTimeout(() => {
                    window.location = '/login';
                }, 3000);
            });
    }

    /**
     * Logout
     * @returns {Promise<void>}
     */
    logout = async () => {
        try {
            await Auth.signOut();
        } catch (error) {
            console.log('error logging out: ', error);
        }
    }
    render() {
        return <Typography variant="h6">{this.state.content}</Typography>;
    }
}

export default Logout;