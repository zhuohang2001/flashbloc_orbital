// 1.recipient_init
// 2.declare_close
// 3.close_now


export const recepient_initiate = async (channel, abi, signer, relevant_info, user_account) => {
    const tx = await channel.recepient_init({value: 1000000000000000})
    await tx.wait() //how do i check if function is successful? do i need event
    console.log('initialized')
}


export const declare_close_channel = async (channel, abi, signer, relevant_info, user_account) => {
    const sigs = [
        "0x5bfcbe9c647c2a812156c1071cfa402b109a77d0c977089bd66807ec7828614d35f64d32f401c7fd88c7c99b4197e6094c6d0c542170980bf9024da1899ea8df1c", 
        "0x0e930539a46340b5ea3130bb850ee28c828539ac1e5dbb3d767adf191ea207dd783116c099a4fc0e8e6d82c8779426d007a82f41779f34346614a9ae583c97931b"
    ]

    const tx = await channel.declare_close(sigs, 1, 1000000000000000, 1000000000000000, 0, 0)
    await tx.wait() //how do i check if function is successful? do i need event
    console.log('declared_close')
}


export const close_now_channel = async (channel, abi, signer, relevant_info, user_account) => {
    const tx = await channel.close_now()
    await tx.wait() //how do i check if function is successful? do i need event
    console.log('closed')
}