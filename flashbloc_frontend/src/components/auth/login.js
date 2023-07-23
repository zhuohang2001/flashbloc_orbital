import React, { useState, useEffect } from 'react';
import axiosInstance from '../axios';
// import { useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { currentLoginAccount, resetLoginAccount, toggleLoginState } from '../../state_reducers/LoginAccountReducer';
import { useDispatch, useSelector } from 'react-redux'


//MaterialUI
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CssTextField = withStyles({
	root: {
	  '& label.Mui-focused': {
		color: 'white',
	  },
	  		
		backgroundColor: 'white',
	  '& .MuiInput-underline:after': {
		borderBottomColor: 'yellow',
	  },
	  '& .MuiOutlinedInput-root': {
		'& fieldset': {
		  borderColor: 'white',
		},
		'&:hover fieldset': {
		  borderColor: 'white',
		},
		'&.Mui-focused fieldset': {
		  borderColor: 'yellow',
		},
		  
	  },
	},
  })(TextField);

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

export default function SignIn() {
    const dispatch = useDispatch();

    // const loginAccount = useSelector((state) => state.loginAccount.current); 
    
	const navigate = useNavigate();
	const initialFormData = Object.freeze({
		email: '', 
        username: '', //should also retrive walletAddress
		password: '',
	});

	const [formData, updateFormData] = useState(initialFormData);

    const showToastErrorMessage = () => {
        toast.error('Sign in error !', {
            position: toast.POSITION.TOP_CENTER
        });
    };

	const handleChange = (e) => {
		updateFormData({
			...formData,
			[e.target.name]: e.target.value.trim(),
		});
	};

    const clicked = async () => {
        dispatch(toggleLoginState({
            Login: true
        }))

		if (localStorage.getItem('access_token')) {
			axiosInstance.get(`user/account/currLogin/${formData.email}/`)
			.then((response) => {
				dispatch(currentLoginAccount({
					'email': response.data.email, 
					'username': response.data.user_name, 
					'walletAddress': response.data.wallet_address
				}))

				localStorage.setItem('email', response.data.email)
				localStorage.setItem('username', response.data.user_name)
				localStorage.setItem('walletAddress', response.data.wallet_address)
				navigate('/');
			}
			)
		}

    }

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(formData);

		await axiosInstance
			.post(`token/`, {
				email: formData.email,
				password: formData.password,
			})
			.then((res) => {
				localStorage.setItem('access_token', res.data.access);
				localStorage.setItem('refresh_token', res.data.refresh);
				axiosInstance.defaults.headers['Authorization'] =
					'JWT ' + localStorage.getItem('access_token');
				//console.log(res);
				//console.log(res.data);

			})
			.catch((error) => showToastErrorMessage())
	};

	const classes = useStyles();

	return (
		<Container component="main" maxWidth="xs">
			<ToastContainer/>
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}></Avatar>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>
				<form className={`bg-secondary-${classes.form}`} noValidate>
					<CssTextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						label="Email Address"
						name="email"
						autoComplete="email"
						autoFocus
						onChange={handleChange}
					/>
					<CssTextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
						onChange={handleChange}
					/>
					<FormControlLabel
						control={<Checkbox value="remember" color="[#FFFFFF]" />}
						label="Remember me"
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="secondary"
						className={classes.submit}
						onClick={ async (e) => { await handleSubmit(e); await clicked(); }}
					>
						Sign In
					</Button>
					<Grid container>
						<Grid item xs>
							<Link href="#" variant="body2">
								Forgot password?
							</Link>
						</Grid>
						<Grid item>
							<Link href="#" variant="body2">
								{"Don't have an account? Sign Up"}
							</Link>
						</Grid>
					</Grid>
				</form>
			</div>
		</Container>
	);
}