import React from 'react'
import axios from 'axios';
import { TextField, Card, Button, CardContent, Typography, FormGroup, Select, MenuItem } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

/**
 * Supported Blockchains
 * @type {{POLYGON: string, ETHEREUM: string, SOLANA: string}}
 */
const BLOCKCHAINS = {
    ETHEREUM: 'ETHEREUM',
    SOLANA: 'SOLANA',
    POLYGON: 'POLYGON',
}

class CreateApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // Existing applications
            applications: null,
            // Input fields
            name: null,
            chain: BLOCKCHAINS.ETHEREUM,
            // UI states
            loading: false,
            nameError: false,
        };
        this.existingApplications = [];
    }

    componentWillMount() {
        // When component first mounts, fetch all existing applications from server
        this.getAllApplications();
    }

    /**
     * Fetch all existing applications from server
     */
    getAllApplications = () => {
        const { isUserLoggedIn } = this.props;
        // Step 1: Fetch from server
        axios.get('http://localhost:3001/listApplications')
            .then((response) => {
                // Step 2: Set local component state
                this.setState({ applications: response.data });
                // Step 3: Clear existingApplications
                this.existingApplications = [];
                // Step 4: Store list of applications that be rendered on the screen
                response.data.forEach((item) => {
                    this.existingApplications.push(
                        this.getCardForApplication(item)
                    );
                });
                // Step 5: Welcome message if developer has never created an application
                // before
                if (isUserLoggedIn && this.existingApplications.length === 0) {
                    this.props.notify('No applications found. Use the form below to create your first application');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * Create a new application
     */
    createApplication = () => {
        const { name, chain } = this.state;
        const { user, notify } = this.props;
        const jwtToken = user?.signInUserSession?.idToken?.jwtToken;
        // Step 1: name is mandatory
        if (!name || name.length === 0) {
            this.setState({ nameError: true });
            return;
        }
        // Step 2: Set loading state
        this.setState({ loading: true });

        // Step 3: Make request with server
        let config = {
            headers: {
                authorization: jwtToken
            }
        }
        const setState = (data) => this.setState(data);
        axios.get(`http://localhost:3001/createApplication?name=${name}&chain=${chain}`, config)
            .then((response) => {
                console.log(response.data);
                this.getAllApplications();
                this.setState({ loading: false });
            })
            .catch(function (error) {
                console.log(error);
                setState({ loading: false });
                notify('Something went wrong, please try again');
            });
    };

    /**
     * Renders a react component to display an individual applicaton on screen
     */
    getCardForApplication = (item) => {
        const copyToClipboard = (e, inputId) => {
            /* Get the text field */
            const copyText = document.getElementById(inputId);
            /* Select the text field */
            copyText.select();
            copyText.setSelectionRange(0, 99999); /* For mobile devices */
            /* Copy the text inside the text field */
            navigator.clipboard.writeText(copyText.value);
            /* Update button text */
            e.target.innerHTML = 'Copied';
        };
        return (
            <Card sx={{ maxWidth: 660 }} variant="outlined" key={item.id}>
                <CardContent>
                    <Typography gutterBottom variant="h6">
                        {item.name}
                    </Typography><br/>
                    <FormGroup row>
                        <TextField
                            size="small"
                            id="application-id"
                            label="Application Id"
                            type='text'
                            defaultValue={item.id}
                            variant='outlined'
                            inputProps={
                                { readOnly: true, }
                            }
                        />
                        <Button
                            onClick={(e) => {
                                copyToClipboard(e, 'application-id');
                            }}
                            size="small"
                            variant="contained"
                            disableElevation>
                            copy
                        </Button>
                    </FormGroup><br/>
                    <FormGroup row>
                        <TextField
                            size="small"
                            id="application-secret"
                            label="Application Secret"
                            type='text'
                            defaultValue={item.secret}
                            variant='outlined'
                            inputProps={
                                { readOnly: true, }
                            }
                        />
                        <Button
                            onClick={(e) => {
                                copyToClipboard(e, 'application-secret')
                            }}
                            size="small"
                            variant="contained"
                            disableElevation>
                            copy
                        </Button>
                    </FormGroup><br/>
                    <Typography variant="body2">
                        <b>Blockchain:</b> {item.chain}
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    render() {
        const { isUserLoggedIn } = this.props;
        if (!isUserLoggedIn) {
            return <Typography variant="h6">Please login first</Typography>
        }
        return (
            <div className="home">
                <div className="mkcard">
                    {/* List existing functions */}
                    <form className="form">
                        <Typography gutterBottom variant="h6" color="primary">
                            Applications
                        </Typography><br/>
                        {this.existingApplications}
                        {this.existingApplications.length === 0 && <p>No applications found. Use the form below to create your first application</p>}
                    </form>
                </div>
                <div className="mkcard">
                    {/* List existing functions */}
                    <form className="form">
                        <Typography gutterBottom variant="h6" color="primary">
                            Create new application
                        </Typography><br/>
                        <TextField
                            size="small"
                            label="Application name"
                            placeholder="Application name"
                            type='text'
                            variant='outlined'
                            required={true}
                            onChange={e => {
                                const value = e.target.value;
                                this.setState({ name: value });
                            }}
                            error={this.state.nameError}
                            helperText={this.state.nameError && 'Something went wrong, try again!'}

                        /><br/>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={this.state.chain}
                            required={true}
                            label="Blockchain"
                            onChange={e => {
                                const value = e.target.value;
                                this.setState({ chain: value });
                            }}
                        >
                            <MenuItem value={BLOCKCHAINS.ETHEREUM}>{BLOCKCHAINS.ETHEREUM}</MenuItem>
                            <MenuItem value={BLOCKCHAINS.POLYGON}>{BLOCKCHAINS.POLYGON}</MenuItem>
                            <MenuItem value={BLOCKCHAINS.SOLANA}>{BLOCKCHAINS.SOLANA}</MenuItem>
                        </Select><br/>
                        <LoadingButton
                            variant="contained"
                            onClick={this.createApplication}
                            loading={this.state.loading}
                            disabled={!this.state.name}
                        >
                            Save
                        </LoadingButton>
                    </form>
                </div>
            </div>
        );
    }
}

export default CreateApp;