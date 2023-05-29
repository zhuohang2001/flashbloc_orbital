import React, { useState, useEffect } from 'react';
import axiosInstance from '../axios';
import { useNavigate } from 'react-router-dom';
import { resetLoginAccount, toggleLoginState } from '../../state_reducers/LoginAccountReducer';
import { useDispatch, useSelector } from 'react-redux'


export default function SignUp() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		const response = axiosInstance.post('user/logout/blacklist/', {
			refresh_token: localStorage.getItem('refresh_token'),
		});
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		localStorage.removeItem('username');
		localStorage.removeItem('email');
		localStorage.removeItem('walletAddress');
		axiosInstance.defaults.headers['Authorization'] = null;
		dispatch(toggleLoginState({
            Login: false
        }))

		dispatch(resetLoginAccount())
		navigate('/login');
	});
	return <div>Logout</div>;
}