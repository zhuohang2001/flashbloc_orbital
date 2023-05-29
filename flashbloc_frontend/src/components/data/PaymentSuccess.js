import React, { Fragment } from 'react';
import UserChannels from './Channels'
// import Details from './Detail'
import { useSelector } from 'react-redux'
import '../static/PaymentSuccess.css'

export default function Dashboard () {
    // const componentState = useSelector((state) => state.component.value)
    return (
        <Fragment>
            <div className="text-center">
                <a href="#myModal" className="trigger-btn" data-toggle="modal">Open Payment Success Modal Box</a>
            </div>

            <div id="myModal" className="modal fade">
                <div className="modal-dialog modal-confirm">
                    <div className="modal-content">
                        <div className="modal-header justify-content-center">
                            <div className="icon-box">
                                <i className="material-icons"></i>
                            </div>
                            <button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
                        </div>
                        <div className="modal-body text-center">
                            <h4>Payment Done!</h4>	
                            <p> ${amount} paid to {addr} !</p>
                            <button className="btn btn-success" data-dismiss="modal"><span>Start Exploring</span> <i className="material-icons"></i></button>
                        </div>
                    </div>
                </div>
            </div>     
        </Fragment>
    );
};
