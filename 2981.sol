// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RoyaltyWhitelistNFT is ERC721, ERC2981, Ownable {
    using MerkleProof for bytes32[];

    // Merkle root for the whitelist
    bytes32 public merkleRoot;
    // Royalty percentage (in basis points)
    uint96 public constant ROYALTY_PERCENTAGE = 500; // 7.5%
    // Tracking minted addresses to prevent multiple mints
    mapping(address => bool) public hasMinted;
    // Maximum supply of NFTs
    uint256 public constant MAX_SUPPLY = 10000; //to be set later
    // Current token ID counter
    uint256 private _currentTokenId;
    uint256 public endTime;
    // Token URIs mapping
    mapping(uint256 => string) private tokenURIs;
    // Events
    event WhitelistRootUpdated(bytes32 newMerkleRoot);
    event NFTMinted(address indexed minter, uint256 tokenId);
    event RoyaltyRecipientUpdated(address newRecipient);

    constructor(
        string memory _name, 
        string memory _symbol, 
        bytes32 _initialMerkleRoot,
        address _royaltyReceiver,
    ) ERC721(_name, _symbol) Ownable() {
        // Set initial Merkle root
        merkleRoot = _initialMerkleRoot;
        endTime = block.timestamp + 172800;
        // Set default royalty for all tokens
        _setDefaultRoyalty(_royaltyReceiver, ROYALTY_PERCENTAGE);
    }

    /**
     * @dev Mint an NFT for whitelisted addresses
     * @param proof Merkle proof to verify whitelist status
     * @param metadataURI URI pointing to the token metadata
     */
    function whitelistMint(bytes32[] calldata proof, string memory metadataURI, uint amount) external {
        // Verify mint conditions
        require(!hasMinted[msg.sender], "Already minted");
        require(_currentTokenId < MAX_SUPPLY, "Max supply reached");
        require(block.timestamp < endTime, "Too Late");
        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount, metadataURI));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Not whitelisted");

        // Mark as minted and increment token ID
        hasMinted[msg.sender] = true;
        for (uint256 i = 0; i < amount; i++) {
            uint256 newTokenId = ++_currentTokenId;
            tokenURIs[newTokenId] = metadataURI;
            _safeMint(msg.sender, newTokenId);
        }

        // Emit mint event
        emit NFTMinted(msg.sender, newTokenId);
    }

    /**
     * @dev Update the Merkle root (only callable by owner)
     * @param _newMerkleRoot New Merkle root for whitelist
     */
    function updateMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
        merkleRoot = _newMerkleRoot;
        emit WhitelistRootUpdated(_newMerkleRoot);
    }

    /**
     * @dev Update royalty recipient (only callable by owner)
     * @param _newRecipient New address to receive royalties
     */
    function updateRoyaltyRecipient(address _newRecipient) external onlyOwner {
        _setDefaultRoyalty(_newRecipient, ROYALTY_PERCENTAGE);
        emit RoyaltyRecipientUpdated(_newRecipient);
    }

    /**
     * @dev Get metadata URI for a given token ID
     * @param tokenId Token ID to retrieve metadata for
     * @return Metadata URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenURIs[tokenId];
    }

    /**
     * @dev Withdraw collected funds (only callable by owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Check if an address is whitelisted
     * @param _address Address to check
     * @param proof Merkle proof for the address
     * @return Whether the address is whitelisted
     */
    function isWhitelisted(
        address _address, 
        bytes32[] calldata proof
    ) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_address));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    /**
     * @dev Total number of minted tokens
     * @return Current number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _currentTokenId;
    }

    // Override supportsInterface to support both ERC721 and ERC2981
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC721, ERC2981) 
        returns (bool) 
    {
        return 
            ERC721.supportsInterface(interfaceId) || 
            ERC2981.supportsInterface(interfaceId);
    }
}
