import "regenerator-runtime/runtime.js";
import {ethers} from 'ethers'
import getCookie from '../csrf.js'
import { JsonRpcBatchProvider } from "@ethersproject/providers";
import axiosInstance from "../components/axios.js";


//functions --> create channel



export const create_channel = async (factory, abi, signer, relevant_info, target_account, user_address) => {
    // console.log(factory)
    const initiator_bal = parseInt(relevant_info.ledger.latest_initiator_bal)
    const expected_recipient_val = parseInt(relevant_info.ledger.latest_recipient_bal)
    // const tx = await factory.startChannel(target_account, 9999999, expected_recipient_val, {value: initiator_bal})
    const tx = await factory.startChannel("0xed2bf05A1ea601eC2f3861F0B3f3379944FAdB12", 1000000000000000, 1000000000000000, {value: 1000000000000000})
    const channel_address = update_db_new_channel(factory, relevant_info, abi, signer, target_account, user_address)
    await tx.wait()
    return channel_address
};

function update_db_new_channel(factory, relevant_info, abi, signer, target_account, user_address) {
    console.log('running')
    return new Promise(function (resolve) {
        factory.on('ChannelStarted' , (contractAddress) => {//what is projectStarted
            axiosInstance
                .patch(`channelstate/createChannel/`, {
                    currAddress: user_address, 
                    targetAddress: target_account, 
                    channelAddress: contractAddress
                })
                .then((res) => {
                    console.log(res)
                })
            // fetch('/newChannel/', {
            //     method: 'POST', 
            //     headers: {
            //     'Accept': 'application/json', 
            //     'Content-Type': 'application/json', 
            //     'X-CSRFToken': getCookie('csrftoken')
            //     }, 
            //     body: data
            // })
            // .then(data => console.log(data)) //how do i check whether POST request is successful
            // console.log(channel_address)
            console.log('HI')
            resolve(contractAddress)
        })
    })
}



// export const  newChannelAddress = async (factory, abi, signer, state) => {
// const adrs = await factory.startChannel(100, '500000000000000000', {value: 1250000000000000}) //values to be changed later
// const channel_address = await update_db_new_channel(factory, state, abi, signer) //to resolve event listener, use Promise, Resolve

// console.log(channel_address, 'returning channel_address')
// return channel_address
// };




// function update_db_new_channel(factory, state, abi, signer) {
// return new Promise(function (resolve) {
//     factory.on('ProjectStarted', (channel_address) => {
//         // console.log(address, 'async works')
//         const proj = new ethers.Contract(address, abi, signer)
//         // console.log(proj, 'PROJ INIT')
//         console.log(state.image, 'image before sending  ')
//         let form_data = new FormData();
//         form_data.append('image', state.image, state.image.name)
//         form_data.append('name', state.name)
//         form_data.append('price', state.price)
//         form_data.append('description', state.description)
//         form_data.append('address', state.address)
    
//         const db = fetch('/api/', {
//             method: 'POST', 
//             headers: {
//                 // 'Accept': 'application/json', 
//                 // 'Content-Type': 'application/json', 
//                 'X-CSRFToken': getCookie('csrftoken')
//             }, 
//             body: form_data
            
//         }).then(data => console.log(data), 'post req')
//         console.log('finish paying')
//         resolve(channel_address)
//     });
// });
// };