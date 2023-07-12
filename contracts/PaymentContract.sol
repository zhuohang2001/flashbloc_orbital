// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract SimplePaymentChannel {
    address payable public initiator;
    address payable public recipient;
    uint256 public expiration;
    // uint public balance;
    uint public initiator_balance;
    uint public recipient_balance;
    struct Party {
        address payable addr;
        uint bal;
        bool approve;
    }
    mapping (uint => Party) Parties;

    bool public recipient_in = false;
    uint public close_duration = 3600 * 24 * 3;
    uint public close_time; //should public be used?
    uint public nonce;
    address payable public parent;
    uint expected_recipient_bal;

    event funcSuccess(
        bool succ
    );

 
    constructor (address payable _initiator, address payable _recipient, uint _duration, uint _expected_recipient_bal) payable {
        // Parties[1].bal = msg.value;
        // Parties[1].approve = false;
        // Parties[1].addr = payable(_initiator);
        // Parties[2].addr = payable(_recipient);        
        Parties[1] = Party({addr: payable(_initiator), bal: msg.value, approve: false});
        Parties[2] = Party({addr: payable(_recipient), bal: 0, approve: false});
        expiration = block.timestamp + _duration; 
        expected_recipient_bal = _expected_recipient_bal;
        parent = payable(msg.sender);
    }

    function recepient_init() public payable {
        //activated by second party; backend will retrieve signature of initiator and 2nd party will key in correct amt
        require(block.timestamp < expiration);
        require(msg.sender == Parties[2].addr);
        require(recipient_in == false);
        require(msg.value == expected_recipient_bal);
        recipient_in = true;
        Parties[2].bal = msg.value;
    }

    function timeout() public {
        // timer for initiator
        require(block.timestamp >= expiration);
        require(recipient_in == true);
        (bool sent_init, ) = initiator.call{value: address(this).balance}("");
        require(sent_init, "Failed to send Ether");
    }

    function declare_close(bytes [2] memory _signature, uint _nonce, uint _init_bal, uint _recp_bal, uint _ptp_init, uint _ptp_recp) public returns (bool) {
        //used when a party wants to close
        require(msg.sender == Parties[1].addr || msg.sender == Parties[2].addr);
        require(_init_bal + _recp_bal + _ptp_init + _ptp_recp <= Parties[1].bal + Parties[2].bal);
        require(_signature.length == 2);
        require((keccak256(abi.encodePacked(_signature[0])) != keccak256(abi.encodePacked(_signature[1]))));
        uint amt = 0;
        bytes32 message = prefixed(keccak256(abi.encodePacked(this, amt, string.concat(Strings.toString(_init_bal), ";", Strings.toString(_recp_bal)), _nonce)));

        for (uint i=0; i < _signature.length; i++) {
            address _signer = recover_signer(message, _signature[i]); //this is assuming that both parties have signed
            require(_signer == Parties[1].addr || _signer == Parties[2].addr);
        } //this logic have to be rewritten
        if (msg.sender == Parties[1].addr) {
            Parties[1].approve = true;
        } else {
            Parties[2].approve = true;
        }

        close_time = block.timestamp + close_duration;
        Parties[2].bal = _recp_bal + _ptp_recp;
        Parties[1].bal = _init_bal + _ptp_init;
        nonce = _nonce;
        return true;
        
    }

    function challenge_close(bytes [2] memory _signature, uint _nonce, uint _init_bal, uint _recp_bal, uint _ptp_init, uint _ptp_recp) public returns (bool) {
        require(_init_bal + _recp_bal + _ptp_init + _ptp_recp <= Parties[1].bal + Parties[2].bal);
        require(_signature.length == 2);
        require((keccak256(abi.encodePacked(_signature[0])) != keccak256(abi.encodePacked(_signature[1]))));
        uint amt = 0;
        bytes32 message = prefixed(keccak256(abi.encodePacked(this, amt, string.concat(Strings.toString(_init_bal), ";", Strings.toString(_recp_bal)), _nonce)));        for (uint i=0; i < _signature.length; i++) {
            address _signer = recover_signer(message, _signature[i]); //how does this verify
            require(_signer == Parties[1].addr || _signer == Parties[2].addr);
        } //ensures that either party of this contract have signed with a newer nonce (msg) 
        //how do i ensure that this message is not fake, accessed from externally (only db have address of contract?)
        require(_nonce > nonce, "invalid challenge");
        if (_nonce < nonce) {
            return false;
        } else {
            Parties[2].bal = _recp_bal + _ptp_recp;
            Parties[1].bal = _init_bal + _ptp_init; //should add penalty for other party if challenge successful
            //should close with new values if challenge successful
            return close_now();        
        }
    }

    function close_now() public returns (bool) {
        //close before expiration date if both party approves
        require((msg.sender == Parties[1].addr && Parties[2].approve == true)|| (msg.sender == Parties[2].addr && Parties[1].approve == true));
        require(close_time >= 0);
        if (msg.sender == Parties[1].addr) {
            Parties[1].approve = true;
        } else {
            Parties[2].approve = true;
        }
        if (Parties[1].approve == true && Parties[2].approve == true) {
            return close();
        } else {
            return false;
        }
    }

    function top_up() public payable {
        if (msg.sender == Parties[1].addr) {
            Parties[1].bal += msg.value;
            emit funcSuccess(true);
        } else if (msg.sender == Parties[2].addr) {
            Parties[2].bal += msg.value;
            emit funcSuccess(true);
        } else {
            emit funcSuccess(false);
        }
    }

    function close() public payable returns (bool) {
        //wait for expiration time to close
        // require(block.timestamp >= close_time);
        require(msg.sender == Parties[1].addr || msg.sender == Parties[2].addr);
        (bool sent_recp, ) = Parties[2].addr.call{value: Parties[2].bal}("");
        require(sent_recp, "Failed to send Ether");
        (bool sent_init, ) = Parties[1].addr.call{value: Parties[1].bal}("");
        require(sent_init, "Failed to send Ether");
        //selfdestruct(parent);
        return true;
    }
        

    function isValidSignature(uint _amount, bytes memory signature) internal view returns (address) {
        bytes32 message = prefixed(keccak256(abi.encodePacked(this, _amount)));
        address signer = recover_signer(message, signature);
        return signer;
    }

    function extend_time(uint _extension) public {
        require(msg.sender == initiator);
        require(_extension > 0);
        expiration += _extension;
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function recover_signer(bytes32 message, bytes memory signature) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return ecrecover(message, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(sig.length == 65);

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    receive() external payable {}

}