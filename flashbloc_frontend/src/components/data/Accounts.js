import React, { Component, Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
// import { updateProposals, addProposal, currentProposal } from '../../features/ProposalReducer';
// import { toggleComponent } from '../../features/componentReducer'
import { MDBCol, MDBIcon } from "mdbreact";
import { addChannel, currentChannel } from '../../state_reducers/ChannelReducer';
import { toggleAccountComponent } from '../../state_reducers/AccountComponentReducer'; 
import { addAccount, currentAccount, setFilteredAccount, addFilteredAccount, resetFilteredAccount } from '../../state_reducers/AccountReducer';



function UserChannels () {
    // console.log(channels, "LISTTTTTTTTTTTTTTTT")
    const dispatch = useDispatch()

    const accounts = useSelector((state) => state.accounts.value.accounts); //get from global state
    const filteredAcc = useSelector((state) => state.accounts.filteredAcc);
    const [AccSearchVal, setAccSearch] = useState("")
    useEffect(() => {
        fetch('http://localhost:8000/api/')//this endpoint should retrive n number of highest transfer value associated accounts (GET)
        .then(response => response.json())
        .then(data => data.forEach(A => dispatch(addAccount(A)))
    )}, []);

    useEffect(() => {
        if (AccSearchVal == "") {
            dispatch(setFilteredAccount(accounts))
        }
    }, [filteredAcc]); //will this do a double call? inifinite loop?


    function clicked (current) {
        dispatch(toggleAccountComponent({
            listAccountComponent: false, 
            detailAccountComponent: true, 
        }))
        dispatch(currentChannel({'address': current}))
    }

    function clickAccSearch () {
        //allow search by walletAddress, name, email --> new api endpoint for this (get by icontains, determine field by regex)

        // dispatch(resetAccounts)
        // fetch('http://localhost:8000/api/')
        // .then(response => response.json())
        // .then(data => data.forEach(A => dispatch(addFilteredAccount(A)))

    }

// require function to send get request to retrieve channels by case insensitive substrings
//CHANGE VIEW TO ONLY SHOW EITHER TOP ASSOC ACCS OR ONLY SEARCH RES, SEARCH RES WILL ONLY REFRESH WHEN PAGE RELOAD?

    return (
        <Fragment>
            <br></br>
            <h2>Leads</h2>
            <div className="flex-container">
                <div className="row row-cols-1 row-cols-md-4 g-4">
                <MDBCol md="8">
                    <MDBFormInline className="md-form mr-auto mb-4">
                        <input className="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search" name="AccSearchValue" onChange={() => setAccSearch}/>
                        <MDBBtn outline color="warning" rounded size="sm" type="submit" className="mr-auto" onClick={() => clickAccSearch()}>
                        Search
                        </MDBBtn>
                    </MDBFormInline>
                </MDBCol>
                {filteredAcc.map((c, i) => (
                    <div className="card" style={{width: "18rem;"}}>
                        <img className="card-img-top" width={"125px"} height={"250px"} src={c.image} alt="Card image cap"/>
                        <div className="card-body">
                            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <ul class="list-group list-group-flush">
                                    <li className="list-group-item">{c.walletAddress}</li>
                                    <li className="list-group-item">{c.name}</li>
                                    <li className="list-group-item"></li>
                                    <li className="list-group-item">
                                    <button
                                            onClick={() => clicked(c.address)} //bind needs to be used
                                            className="btn btn-primary btn-sm"
                                        >
                                        {' '}
                                        Details
                                        </button>
                                    </li>
                                </ul>
                        </div>
                    </div>
                ))
                };
                </div>
            </div>
        </Fragment>
    )
  
}

export default UserChannels;