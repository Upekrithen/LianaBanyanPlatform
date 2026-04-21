// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title LianaBanyanMedallion
 * @dev ERC-1155 Token for LianaBanyan Project Medallions
 *
 * Token IDs:
 * 1 = Seed Funding (100 max supply, $5.00 each)
 * 2 = Early Supporter (250 max supply, $4.50 each)
 * 3 = Community Builder (500 max supply, $4.00 each)
 * 4 = Project Champion (1000 max supply, $3.50 each)
 */
contract LianaBanyanMedallion is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    // Token tier names
    string public name = "LianaBanyan Medallion";
    string public symbol = "LBM";

    // Maximum supply per tier
    mapping(uint256 => uint256) public maxSupply;

    // Base URI for token metadata
    string private _baseURI;

    // Project-specific info
    string public projectName;
    string public projectSKU;

    constructor(
        string memory baseURI,
        string memory _projectName,
        string memory _projectSKU,
        address initialOwner
    ) ERC1155(baseURI) Ownable(initialOwner) {
        _baseURI = baseURI;
        projectName = _projectName;
        projectSKU = _projectSKU;

        // Set max supplies for each tier
        maxSupply[1] = 100;   // Seed Funding
        maxSupply[2] = 250;   // Early Supporter
        maxSupply[3] = 500;   // Community Builder
        maxSupply[4] = 1000;  // Project Champion
    }

    /**
     * @dev Sets a new base URI for all token types
     */
    function setURI(string memory newuri) public onlyOwner {
        _baseURI = newuri;
        _setURI(newuri);
    }

    /**
     * @dev Returns the URI for a specific token ID
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, Strings.toString(tokenId), ".json"));
    }

    /**
     * @dev Mint a single medallion to an address
     * @param account The address to mint to
     * @param id The token ID (tier)
     * @param amount The amount to mint (usually 1 for medallions)
     */
    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        require(id >= 1 && id <= 4, "Invalid token ID");
        require(totalSupply(id) + amount <= maxSupply[id], "Exceeds max supply");
        _mint(account, id, amount, data);
    }

    /**
     * @dev Batch mint medallions to multiple addresses
     * @param to Array of recipient addresses
     * @param ids Array of token IDs (tiers)
     * @param amounts Array of amounts to mint
     */
    function mintBatch(
        address[] memory to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        require(to.length == ids.length && ids.length == amounts.length, "Array length mismatch");

        for (uint256 i = 0; i < to.length; i++) {
            require(ids[i] >= 1 && ids[i] <= 4, "Invalid token ID");
            require(totalSupply(ids[i]) + amounts[i] <= maxSupply[ids[i]], "Exceeds max supply");
            _mint(to[i], ids[i], amounts[i], data);
        }
    }

    /**
     * @dev Get remaining supply for a tier
     */
    function remainingSupply(uint256 id) public view returns (uint256) {
        require(id >= 1 && id <= 4, "Invalid token ID");
        return maxSupply[id] - totalSupply(id);
    }

    /**
     * @dev Check if an address holds a specific medallion tier
     */
    function hasMedallion(address account, uint256 id) public view returns (bool) {
        return balanceOf(account, id) > 0;
    }

    /**
     * @dev Get all medallion balances for an address
     */
    function getMedallionBalances(address account) public view returns (uint256[4] memory) {
        return [
            balanceOf(account, 1),
            balanceOf(account, 2),
            balanceOf(account, 3),
            balanceOf(account, 4)
        ];
    }

    // Required overrides
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}

// Import this library for string conversion
library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
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
