import React, { useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import { NavLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';

import { useDispatch, useSelector } from 'react-redux'
import { currentLoginAccount, resetLoginAccount, toggleLoginState } from '../../state_reducers/LoginAccountReducer';

import FlashblocLogo from '../../assets/flashbloc_logo.png'


const useStyles = makeStyles((theme) => ({
	appBar: {
		borderBottom: `1px solid ${theme.palette.divider}`,
	},
	link: {
		margin: theme.spacing(1, 1.5),
	},
	toolbarTitle: {
		flexGrow: 1,
	},
}));

function Header() {
	const loginAccount = useSelector((state) => state.loginAccount.value.current);
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(currentLoginAccount({
			'email': localStorage.getItem('email'), 
			'username': localStorage.getItem('username'), 
			'walletAddress': localStorage.getItem('walletAddress')
		}));
	  }, []);




	const classes = useStyles();
	return (
		<React.Fragment>
			<CssBaseline />
			<AppBar
				position="static"
				color="default"
				elevation={0}
				className={classes.appBar}
			>
				<Toolbar className={`bg-black ${classes.toolbar}`}>

					<Typography
						variant="h6"
						color="inherit"
						noWrap
						className={classes.toolbarTitle}
					>
						<Link
							component={NavLink}
							to="/"
							underline="none"
							color="textWhite"
						>
							<img src={FlashblocLogo} className="w-[50%] h-[50%] relative z-[5]" alt="" srcset="" />
						</Link>
					</Typography>
					<nav>
						<Link
							component={NavLink}
							to="/"
							underline="none"
							color="textWhite"
						>
							{loginAccount.walletAddress}
						</Link>
					</nav>

					<Button
						href="#"
						color="primary"
						variant="outlined"
						className={classes.link}
						component={NavLink}
						to="/register"
					>
						Signup
					</Button>

					<Button
						href="#"
						color="primary"
						variant="outlined"
						className={classes.link}
						component={NavLink}
						to="/login"
					>
						Login
					</Button>
					<Button
						href="#"
						color="primary"
						variant="outlined"
						className={classes.link}
						component={NavLink}
						to="/logout"
					>
						Logout
					</Button>
				</Toolbar>
			</AppBar>
		</React.Fragment>
	);
}

export default Header;