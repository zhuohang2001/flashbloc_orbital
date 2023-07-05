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
            const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
            [data.channelAddress, 0, parseInt(data.initBal) + ";" + parseInt(data.recpBal), data.nonce])
            signedMessage = await signer.signMessage(hashedMsg)
            res = data.result
            nonce = data.nonce
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
            resolve([signedMessage, res, nonce])
        })
    })
}
