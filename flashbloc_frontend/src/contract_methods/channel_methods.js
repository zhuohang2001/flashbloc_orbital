// 1.recipient_init
// 2.declare_close
// 3.close_now

import {ethers} from 'ethers'



export const recepient_initiate = async (channel, val) => {
    const tx = await channel.recepient_init({value: val})
    await tx.wait() //how do i check if function is successful? do i need event
    console.log('initialized')
}


export const declare_close_channel = async (channel, sigs, item, nonce, data) => {
    // const sigs = [
    //     "0x9476a60f5d44b367ee166538341960c2d59106d88ebdf79e194bff9395c97e97206614edf31c14c88ee37e99778ae7d8b8a07d5d7cdb9e52d48702682bbc453a1c", 
    //     "0x3931f54be1f576ee7eef9df570bb66568a46a39815588b9f62cb45f094009b4664232c09273896a185a1c257af01ee2ca3b7c27502486ef02620b0ce91cc75be1b"
    // ]

    // const tx = await channel.declare_close(sigs, 1, 1000000000000000, 1000000000000000, 0, 0)
    // await tx.wait() //how do i check if function is successful? do i need event
    console.log("declaring close")
    console.log(sigs)
    console.log(item)
    console.log(nonce)
    const tx = await channel.declare_close(sigs, nonce, parseInt(data.lkInitBal), 
        parseInt(data.lkRecpBal), parseInt(item.ledger.ptp_initiator_bal), parseInt(item.ledger.ptp_recipient_bal))
    tx.wait()
    console.log('declared_close')
}


export const close_now_channel = async (channel) => {
    const tx = await channel.close_now()
    await tx.wait() //how do i check if function is successful? do i need event
    console.log('closed')
}


export const challenge_close_channel = async (channel, sigs, item, nonce, data) => {
    await channel.challenge_close(sigs, nonce, parseInt(parseFloat(data.lkInitBal)), 
        parseInt(parseFloat(data.lkRecpBal)), parseInt(item.ledger.ptp_initiator_bal), parseInt(item.ledger.ptp_recipient_bal))
    console.log('challenged_close')
    
}

export const topup_channel = async (channel, val) => {
    const tx = await channel.top_up({value: ethers.BigNumber.from(parseInt(val).toString()), gasLimit: ethers.BigNumber.from(parseInt(100000).toString()) }) //rm first args after
    const callRes = awaitFunctionSuccess(channel)
    await tx.wait()
    return callRes
}


function awaitFunctionSuccess(channel) {
    return new Promise(function (resolve) {
        channel.on('funcSuccess', (status) => {
            resolve(status)
        })
    })
}