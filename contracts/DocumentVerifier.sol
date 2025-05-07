// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentVerifier {
    struct Document {
        string fileHash;
        string title;
        string description;
        address owner;
        uint256 timestamp;
    }

    mapping(string => Document) private documents;
    mapping(address => string[]) private uploadsByAddress;
    mapping(address => bool) public isUploader;

    modifier onlyUploader() {
        require(isUploader[msg.sender], "Not authorized");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == address(this), "Not the contract owner");
        _;
    }

    event DocumentUploaded(
        string fileHash,
        string title,
        string description,
        address indexed owner,
        uint256 timestamp
    );

    event DocumentVerified(
        string fileHash,
        bool isValid,
        address indexed verifier
    );

    // ✅ Upload Document
    function uploadDocument(
        string memory fileHash,
        string memory title,
        string memory description
    ) public {
        require(bytes(fileHash).length > 0, "Invalid file hash");
        require(documents[fileHash].timestamp == 0, "Document already exists");

        documents[fileHash] = Document(fileHash, title, description, msg.sender, block.timestamp);
        uploadsByAddress[msg.sender].push(fileHash);

        emit DocumentUploaded(fileHash, title, description, msg.sender, block.timestamp);
    }

    // ✅ Verify Document (made 'view' to avoid sendTransaction requirement)
    function verifyDocument(
        string memory fileHash
    ) public view returns (bool isValid) {
        isValid = documents[fileHash].timestamp != 0;
        // ❌ emit event not needed anymore since this is a view function
    }

    // ✅ Get Uploads by Wallet Address
    function getUploadsByAddress(address user) public view returns (Document[] memory) {
        string[] memory fileHashes = uploadsByAddress[user];
        Document[] memory result = new Document[](fileHashes.length);
        for (uint i = 0; i < fileHashes.length; i++) {
            result[i] = documents[fileHashes[i]];
        }
        return result;
    }
   


    // ✅ Manual Verify Page - Document Info
    function getDocumentDetails(string memory fileHash) public view returns (
        string memory title,
        string memory description,
        address owner,
        uint256 timestamp
    ) {
        Document memory doc = documents[fileHash];
        return (doc.title, doc.description, doc.owner, doc.timestamp);
    }
}
