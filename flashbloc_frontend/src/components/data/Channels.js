import React, { Component, Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
// import { updateProposals, addProposal, currentProposal } from '../../features/ProposalReducer';
// import { toggleComponent } from '../../features/componentReducer'
import { MDBCol, MDBIcon } from "mdbreact";
import { addChannel, currentChannel } from '../../state_reducers/ChannelReducer';
import { toggleChannelComponent } from '../../state_reducers/ChannelComponentReducer';



function UserChannels () {
    // console.log(channels, "LISTTTTTTTTTTTTTTTT")
    const dispatch = useDispatch()
    
    useEffect(() => {
        fetch('http://localhost:8000/api/') //call get all users channel frontend
        .then(response => response.json())
        .then(data => data.forEach(C => dispatch(addChannel(C))) // add to state
    )}, [dispatch]);

    const channels = useSelector((state) => state.channels.value.channels); //get from global state
    const [filteredData, setFilteredData] = useState(channels);
    const [wordEntered, setWordEntered] = useState("");

    function clicked (current) {
        dispatch(toggleChannelComponent({
            listChannelComponent: false, 
            detailChannelComponent: true, 
        }))
        dispatch(currentChannel({'address': current}))
    }

    const handleFilter = (event) => {
        const searchWord = event.target.value;
        setWordEntered(searchWord);
        const newFilter = channels.filter((value) => {
          return value.name.toLowerCase().includes(searchWord.toLowerCase());
        });
    
        if (searchWord === "") {
          setFilteredData(channels);
        } else {
          setFilteredData(newFilter);
        }
      }; //will need to be expanded to also allow address search

    return (
        <Fragment>
            <MDBCol md="6">
                <div className="input-group md-form form-sm form-1 pl-0">
                    <div className="input-group-prepend">
                        <span className="input-group-text purple lighten-3" id="basic-text1">
                            <MDBIcon className="text-white" icon="search" />
                        </span>
                    </div>
                    <input
                    className="form-control my-0 py-1"
                    type="text"
                    placeholder="Search"
                    aria-label="Search"
                    value={wordEntered}
                    onChange={handleFilter}
                    />
                </div>
            </MDBCol>
            <br></br>
            <h2>Leads</h2>
            <div className="row row-cols-1 row-cols-md-4 g-4">
            {filteredData.map((c, i) => (
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
           
            
        </Fragment>
    )
  
}

export default UserChannels;