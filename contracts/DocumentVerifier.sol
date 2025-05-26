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

    // ✅ Upload Single Document
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

    // ✅ Upload Multiple Documents
    function uploadDocuments(
        string[] memory fileHashes,
        string memory title,
        string memory description
    ) public {
        for (uint i = 0; i < fileHashes.length; i++) {
            string memory fileHash = fileHashes[i];

            require(bytes(fileHash).length > 0, "Invalid file hash");
            require(documents[fileHash].timestamp == 0, "Document already exists");

            documents[fileHash] = Document(fileHash, title, description, msg.sender, block.timestamp);
            uploadsByAddress[msg.sender].push(fileHash);

            emit DocumentUploaded(fileHash, title, description, msg.sender, block.timestamp);
        }
    }

    // ✅ Verify Document
    function verifyDocument(string memory fileHash) public view returns (bool isValid) {
        isValid = documents[fileHash].timestamp != 0;
    }

    // ✅ Get All Uploads
    function getUploadsByAddress(address user) public view returns (Document[] memory) {
        string[] memory fileHashes = uploadsByAddress[user];
        Document[] memory result = new Document[](fileHashes.length);
        for (uint i = 0; i < fileHashes.length; i++) {
            result[i] = documents[fileHashes[i]];
        }
        return result;
    }

    // ✅ Get Document Details
    function getDocumentDetails(string memory fileHash) public view returns (
        string memory title,
        string memory description,
        address owner,
        uint256 timestamp
    ) {
        Document memory doc = documents[fileHash];
        return (doc.title, doc.description, doc.owner, doc.timestamp);
    }

    // ✅ Delete Document
    function deleteDocument(string memory fileHash) public {
        require(documents[fileHash].timestamp != 0, "Document does not exist");
        require(documents[fileHash].owner == msg.sender, "Not the owner of this document");

        delete documents[fileHash];

        string[] storage userUploads = uploadsByAddress[msg.sender];
        for (uint i = 0; i < userUploads.length; i++) {
            if (keccak256(bytes(userUploads[i])) == keccak256(bytes(fileHash))) {
                userUploads[i] = userUploads[userUploads.length - 1];
                userUploads.pop();
                break;
            }
        }
    }

    // ✅ Delete Multiple Documents in One Transaction
    function deleteDocuments(string[] memory fileHashes) public {
        for (uint i = 0; i < fileHashes.length; i++) {
            string memory fileHash = fileHashes[i];

            require(documents[fileHash].timestamp != 0, "One of the documents does not exist");
            require(documents[fileHash].owner == msg.sender, "Not the owner of one or more documents");

            delete documents[fileHash];

            string[] storage userUploads = uploadsByAddress[msg.sender];
            for (uint j = 0; j < userUploads.length; j++) {
                if (keccak256(bytes(userUploads[j])) == keccak256(bytes(fileHash))) {
                    userUploads[j] = userUploads[userUploads.length - 1];
                    userUploads.pop();
                    break;
                }
            }
        }
    }
}
