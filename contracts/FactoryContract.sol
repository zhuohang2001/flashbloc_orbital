// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import './PaymentContract.sol';

contract ChannelFactory {
    mapping(address=>userContracts) public UserContracts;
    SimplePaymentChannel[] public paymentList;

    event ChannelStarted(
        address contractAddress
    );

    struct userContracts{
        uint nil;                       //nil value
        address[] usercontracts;        //Array of the Liquefi contracts
    }



    function startChannel(address payable _recipient, uint _duration, uint _expected_recipient_bal) public payable {
        SimplePaymentChannel newContract = new SimplePaymentChannel(payable(address(msg.sender)), _recipient, _duration, _expected_recipient_bal);
        paymentList.push(newContract);
        UserContracts[msg.sender].usercontracts.push(address(newContract));
        emit ChannelStarted(
            address(newContract)
        );
    }

    function viewPaymentContracts()public view returns (SimplePaymentChannel[] memory){     //View an array of ALL the contracts
        return paymentList;
    }

    function viewusercontracts(address user)public view returns (address[] memory){         //View an array of a user's contracts
        return UserContracts[user].usercontracts;
    }
}