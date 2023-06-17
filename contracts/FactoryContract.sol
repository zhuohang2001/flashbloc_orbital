// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import './flowChannel.sol';

contract ChannelFactory {
    mapping(address=>userContracts) public UserContracts;
    SimplePaymentChannel[] public flowList;

    event ChannelStarted(
        address contractAddress
    );

    struct userContracts{
        uint nil;                                                   //nil value
        address[] usercontracts;                                     //Array of the Liquefi contracts
    }



    function startChannel(address payable _recipient, uint _duration, uint _expected_recipient_bal) public payable {
        // SimplePaymentChannel newContract = new SimplePaymentChannel(payable(address(msg.sender)), _recipient, _duration, _expected_recipient_bal);
        SimplePaymentChannel newContract = (new SimplePaymentChannel){value: msg.value}({
            _initiator: payable(address(msg.sender)), 
            _recipient: _recipient, 
            _duration: _duration, 
            _expected_recipient_bal: _expected_recipient_bal
        });
        flowList.push(newContract);
        UserContracts[msg.sender].usercontracts.push(address(newContract));
        emit ChannelStarted(
            address(newContract)
        );
    }

    function viewFlowContracts()public view returns (SimplePaymentChannel[] memory){     //View an array of ALL the contracts
        return flowList;
    }

    function viewusercontracts(address user)public view returns (address[] memory){         //View an array of a user's contracts
        return UserContracts[user].usercontracts;
    }
}