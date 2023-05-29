import React, { Fragment } from 'react';
import UserChannels from './Channels'
// import Details from './Detail'
import { useSelector } from 'react-redux'

export default function Dashboard () {
    // const componentState = useSelector((state) => state.component.value)
    return (
        <Fragment>
            {/* {componentState.detailComponent && <Details/>} */}
            <UserChannels/>
        </Fragment>
    );
};