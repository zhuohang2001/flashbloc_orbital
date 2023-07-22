import { ethers } from 'ethers'
import axiosInstance from './axios';

export const sign_latest_tx = async (currAddress, channelAddress) => { //how to check if signing not needed
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    var res = ''
    var nonce = ''
    return new Promise(function (resolve) {
        var signedMessage = ''
        axiosInstance.get(`channelstate/getLatestTx/?currAddress=${currAddress}&channelAddress=${channelAddress}`)
        .then((response) => response.data)
        .then((arr) => JSON.parse(arr))
        .then(async (data) => {
            console.log("LOGGING DATA")
            console.log(data)   
            if (data.result == "sign here") {
                const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
                [data.channelAddress.toLowerCase(), 0, parseInt(data.initBal) + ";" + parseInt(data.recpBal), data.latestNonce])
                signedMessage = await signer.signMessage(ethers.utils.arrayify(hashedMsg))
                res = data.result
                nonce = data.latestNonce
                axiosInstance.post(`channelstate/signLatestTx/`, {
                    currAddress: currAddress, 
                    channelAddress: channelAddress, 
                    txSignature: signedMessage, 
                    nonce: data.latestNonce
                }).then(response => console.log(response))
            } else {
                const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
                [data.channelAddress.toLowerCase(), 0, parseInt(data.initLkBal) + ";" + parseInt(data.recpLkBal), data.lockedNonce])
                signedMessage = await signer.signMessage(ethers.utils.arrayify(hashedMsg))
                // const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
                // ["0x5007A5a681274e415043b71562e35D9073be38Ca".toLowerCase(), 0, parseInt(data.initLkBal) + ";" + parseInt(data.recpLkBal), data.lockedNonce])
                console.log(data)
                console.log(hashedMsg)
                
                // signedMessage = await provider.personalSign(hashedMsg, signer)
                // signedMessage = await signer.provider.send('personal_sign', [hashedMsg, "0xdf09aA84d23Cc649B557f8B107a676dACaAd228e".toLowerCase()])
                res = data.result
                nonce = data.lockedNonce
                console.log(signedMessage)
                console.log("signing not needed")
            }
            resolve([signedMessage, res, nonce])
        })
    })
}

export const sign_locked_tx = async (currAddress, channelAddress) => { //how to check if signing not needed
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    var res = ''
    var nonce = ''
    return new Promise(function (resolve) {
        var signedMessage = ''
        axiosInstance.get(`channelstate/getLatestTx/?currAddress=${currAddress}&channelAddress=${channelAddress}`)
        .then((response) => response.data)
        .then((arr) => JSON.parse(arr))
        .then(async (data) => {
            console.log("LOGGING DATA")
            console.log(data)   

            const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
            [data.channelAddress.toLowerCase(), 0, parseInt(data.initLkBal) + ";" + parseInt(data.recpLkBal), data.lockedNonce])
            signedMessage = await signer.signMessage(ethers.utils.arrayify(hashedMsg))
            // const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
            // ["0x5007A5a681274e415043b71562e35D9073be38Ca".toLowerCase(), 0, parseInt(data.initLkBal) + ";" + parseInt(data.recpLkBal), data.lockedNonce])
            console.log(data)
            console.log(hashedMsg)
            
            // signedMessage = await provider.personalSign(hashedMsg, signer)
            // signedMessage = await signer.provider.send('personal_sign', [hashedMsg, "0xdf09aA84d23Cc649B557f8B107a676dACaAd228e".toLowerCase()])
            res = data.result
            nonce = data.lockedNonce
            console.log(signedMessage)
            console.log("signing not needed")
            
            resolve([signedMessage, res, nonce])
        })
    })
}
