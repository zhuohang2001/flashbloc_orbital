```
1.recipient_init
2.declare_close
3.close_now
```

export const recipient_initiate = async (channel, abi, signer, relevant_info, user_account) => {
    const tx = await channel.recipient_init({value: 1000000000000000})
    await tx.wait() //how do i check if function is successful? do i need event
    console.log('initialized')
}