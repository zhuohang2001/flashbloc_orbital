// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import './flowChannel.sol';

contract ChannelFactory {

    event ChannelStarted(
        address contractAddress
    );

    function startChannel(address payable _recipient, uint _duration, uint _expected_recipient_bal) public payable {
        // SimplePaymentChannel newContract = new SimplePaymentChannel(payable(address(msg.sender)), _recipient, _duration, _expected_recipient_bal);
        SimplePaymentChannel newContract = (new SimplePaymentChannel){value: msg.value}({
            _initiator: payable(address(msg.sender)), 
            _recipient: _recipient, 
            _duration: _duration, 
            _expected_recipient_bal: _expected_recipient_bal
        });
        emit ChannelStarted(
            address(newContract)
        );
    }

}