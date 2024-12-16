// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HelloAbstract {
    uint256 public deploymentIndex;
    string public deploymentDate;
    
    constructor(uint256 _index, string memory _deploymentDate) {
        deploymentIndex = _index;
        deploymentDate = _deploymentDate;
    }
    
    function sayHello() public view returns (string memory) {
        return string(
            abi.encodePacked(
                "Hey world from Lisbon Labs - Contract #",
                uint256ToString(deploymentIndex + 1),
                ", deployed at ",
                deploymentDate
            )
        );
    }
    
    // Helper function to convert uint to string
    function uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
} 