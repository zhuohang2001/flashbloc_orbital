import { ethers } from 'ethers'
import axiosInstance from './axios';

export const sign_latest_tx = async (currAddress, channelAddress) => { //how to check if signing not needed
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    return new Promise(function (resolve) {
        var signedMessage = ''
        axiosInstance.get(`channelstate/getLatestTx/?currAddress=${currAddress}&channelAddress=${channelAddress}`)
        .then((response) => response.data)
        .then(async (data) => {
            const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
            [data.channelAddress, 0, data.initBal + ";" + data.recpBal, data.nonce])
            signedMessage = await signer.signMessage(hashedMsg)
            if (data.result == "sign here") {
                axiosInstance.post(`channelstate/signLatestTx/`, {
                    currAddress: currAddress, 
                    channelAddress: channelAddress, 
                    txSignature: signedMessage, 
                    nonce: data.nonce
                }).then(response => console.log(response))
            } else {
                console.log("signing not needed")
            }
        })
        .finally(() => {
            resolve([signedMessage, data.result, data.nonce])
        })
        // resolve(signedMessage)
    })
}
