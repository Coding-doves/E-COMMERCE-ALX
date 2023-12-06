// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import'@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract ERCPayment{
    address public admin;
    IERC20 public dai;

    event paymentSuccess(
        address payer,
        uint amount, 
        uint paymentId,
        uint date
        );

    // initialize admin account and the dai address
    constructor (address adminAddress, address daiAddress) public {
        admin = adminAddress;
        dai = IERC20(daiAddress);
    }

    function payment(uint amount, uint paymentId) external {
        dai.transferFrom(msg.sender, admin, amount);
        emit paymentSuccess(msg.sender, amount, paymentId, block.timestamp);
    }
}
