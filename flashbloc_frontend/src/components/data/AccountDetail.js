// import React, { Fragment, useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { Contract, ethers } from 'ethers'
// import { render } from 'react-dom'
// import { currentProposal } from '../../features/ProposalReducer' 
// import { FcApproval, FcHighPriority } from "react-icons/fc";
// import { currentAccount } from '../../state_reducers/AccountReducer'
// import CreateChannelForm from './CreateChannel'


// export default function AccountDetails () {
//     const [pathPresent, togglePathPresent] = useState(0)
//     const [paidStatus, togglePaidStatus] = useState(0)
//     const curr_account = useSelector((state) => state.accounts.value.current)

//     const dispatch = useDispatch()

//     const clickPathSearch = () => {
//         fetch(`/targetChannel/${userAccount.address}/${currAccount.address}`)
//         .then(response => response.json())
//         .then(data => {
//             if(path) {
//                 dispatch(setPath({
//                     "amount": currPathAmt, 
//                     "pathArray": data["path"]
//                 }))
//                 togglePathPresent(1)
//             }
//         })
//     };

//     const clickPathPay = async () => {
//         data = {
//             "pathArray": currPath.pathArray, 
//             "amount": currPath.amount
//         }

//         fetch("/ptpExecute", {
//             method: "POST", 
//             headers: {
//                 'X-CSRFToken': getCookie('csrftoken')
//             }, 
//             body: data
//         })
//         .then(response => response.json())
//         .then(data => {
//             if ('amount' in data && 'status' in data && data["status"] == "SUCCESS") {
//                 dispatch(togglePaidStatus(1))
//             }
//         })
//         .then(console.log(data))
//     };



//     // const [refundable, setRefundable] = useState(true)
//     // const [warn, setWarn] = useState(false)
//     // const [contrib_amt, changeContrib] = useState(0)
//     // const currProposal = useSelector((state) => state.proposals.value.current)
//     // const currentAddr = currProposal.address
//     // console.log('THIS IS DETAIL', currProposal)
//     // const factory = useSelector((state) => state.factory.value)

//     // const projInstance = new ethers.Contract(currentAddr, factory.project_abi, factory.signer)
 

//     // useEffect(() => {
//     //     fields(projInstance)
//     //     db_data(currentAddr)
//     //  }, [])

    

//     // const fields = async (pi) => {
//     //     console.log('logger')
//     //     const details = await Promise.resolve(pi.getDetails())
//     //     var currentAmount = ethers.BigNumber.from(details.currentAmount._hex).toString()
//     //     var currentState = details.currentState
//     //     var deadline = ethers.BigNumber.from(details.deadline._hex).toString()
//     //     var goalAmount = ethers.BigNumber.from(details.goalAmount._hex).toString()
//     //     var nftPrice = ethers.BigNumber.from(details.nftPrice._hex).toString()
//     //     var projectStarter = details.projectStarter
//     //     dispatch(currentProposal({
//     //         'currentAmount': currentAmount, 
//     //         'currentState': currentState, 
//     //         'deadline': deadline, 
//     //         'goalAmount': goalAmount, 
//     //         'price': nftPrice, 
//     //         'projectStarter': projectStarter, 
//     //     }))
//     // }

//     // const db_data = () => {
//     //     fetch(`http://localhost:8000/api/${currentAddr}`)
//     //     .then(response => response.json())
//     //     .then(data => dispatch(currentProposal({
//     //         'address': data.address, 
//     //         'created_at': data.created_at, 
//     //         'image': data.image, 
//     //         'name': data.name, 
//     //         'price': data.price
//     //     })))
//     // }   

//     // const contrib = async (e) => {
//     //     e.preventDefault()
//     //     var amt = ethers.BigNumber.from(contrib_amt)
//     //     try {
//     //         const transaction = await Promise.resolve(projInstance.contribute({value: amt}))
//     //         console.log('hello')
//     //         const { sender, value, currBalance } = await Promise.resolve(confirmContrib(projInstance))
//     //         console.log('why fail')
//     //          dispatch(currentProposal({
//     //              'currentAmount': currBalance
//     //         }))
//     //         setWarn(false)
//     //         console.log('trasnsaction suceceeded')
//     //     } catch {
//     //         setWarn(true)
//     //         console.log('transaction failed')
//     //     }

//     // }

//     // const confirmContrib = async (proj) => {
//     //     console.log('confirming...')
//     //     return new Promise(function (resolve) {
//     //         proj.on('FundingReceived', (sender, value, currBalance) => { //await event emitted by contract
//     //             console.log(sender, 'sender')
//     //             resolve({ sender, value, currBalance })
//     //         })
//     //     })
//     // }

//     // const getRefund = async (e) => {
//     //     try{
//     //         const refunded = await Promise.resolve(projInstance.getRefund())
//     //         console.log(refunded, 'refunded?')
//     //         setRefundable(true)
//     //     } catch {
//     //         console.log('refund fail')
//     //         setRefundable(false)
//     //     }
        
//     // }

//     const buttonState = currProposal.currentState == 1
//     console.log(buttonState)


//     return (
//         <Fragment>
//             <h1>Account Details</h1>
//             <div className="container">
//                 {curr_account.map((acc) => (
//                 <div className="row">
//                     <div className="col-lg-4 mb-4">
//                             <div className="card text-white bg-info mb-3" style="max-width: 18rem;">
//                             <div className="card-header">Header</div>
//                                 <div className="card-body">
//                                     <h5 className="card-title">Account Info</h5>
//                                     <ul>
//                                         <li key={acc.id}>Address: {acc.walletAddress} </li>
//                                         <li key={acc.id}>Email: {acc.email}</li>
//                                     </ul>
//                                 </div>
//                         </div>
                    
//                     </div>
//                     <div className="col-lg-4 mb-4">
//                         <div className="card text-white bg-dark mb-3" style="max-width: 18rem;">
//                             <div className="card-header">Header</div>
//                                 <div className="card-body">
//                                     <h5 className="card-title">Transaction amount</h5>
//                                     <ul>
//                                         <li key={acc.id}>To Amount {acc.toAmount}</li>
//                                         <li key={acc.id}>Address: {acc.fromAmount}</li>
//                                     </ul>
//                                 </div>
//                             </div>
//                     </div>   
                
//                 </div>
//                 ))};

//                 <div className="row">
//                     <div className="col-lg-4 mb-4">
//                         {current_account.channel && <ChannelDetail/>}
//                         {!current_account.channel && <CreateChannelForm/>}
//                     </div>
//                     <MDBCol md="4">
//                         <MDBFormInline className="md-form mr-auto mb-4">
//                             <input className="form-control mr-sm-2" type="text" placeholder="Amount" aria-label="Amount" name="AmtTransfer" onChange={() => setPathAmt}/>
//                             <MDBBtn outline color="warning" rounded size="sm" type="submit" classNameName="mr-auto" onClick={() => clickPathSearch()}>
//                             Find Path
//                             </MDBBtn>
//                             {pathPresent && 
//                                 <MDBBtn outline color="warning" rounded size="sm" type="submit" classNameName="mr-auto" onClick={() => clickPathPay()}>
//                                 Find Path
//                                 </MDBBtn>
//                             }
//                             {paidStatus && <PaymentSuccess amt={currPath.amount} addr={acc.address}/>}
//                         </MDBFormInline>
//                     </MDBCol>
//                 </div>
//             </div>
//         </Fragment>
//     )
// }
