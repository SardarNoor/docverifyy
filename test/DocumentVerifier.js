const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentVerifier", function () {
  let DocumentVerifier, documentVerifier, owner, addr1;

  beforeEach(async function () {
    // Deploy the contract
    DocumentVerifier = await ethers.getContractFactory("DocumentVerifier");
    documentVerifier = await DocumentVerifier.deploy();

    // Get signers
    [owner, addr1] = await ethers.getSigners();
  });

  it("Should upload a document and emit an event", async function () {
    const fileHash = "0x123456789abcdef";
  
    // Send the transaction
    const tx = await documentVerifier.connect(addr1).uploadDocument(fileHash);
  
    // Wait for the transaction to be mined and get the receipt
    const receipt = await tx.wait();
    
    // Log the receipt to inspect the logs
    console.log("Receipt:", receipt);
  
    // Explicitly filter for the "DocumentUploaded" event
    // Only filter by indexed parameters: fileHash and owner
    const eventFilter = documentVerifier.filters.DocumentUploaded(fileHash, addr1.address, null);
    const events = await documentVerifier.queryFilter(eventFilter, receipt.blockNumber, receipt.blockNumber);
  
    // Ensure at least one event was emitted
    expect(events.length).to.be.greaterThan(0);
  
    // Verify the event arguments
    if (events.length > 0) {
      const event = events[0];
      console.log("Event Args:", event.args); // Log event arguments for debugging
      expect(event.args.fileHash).to.equal(fileHash);
      expect(event.args.owner).to.equal(addr1.address);
      
      // Ensure the timestamp is valid (greater than 0)
      const timestamp = event.args.timestamp.toNumber();
      expect(timestamp).to.be.greaterThan(0);
    }
  
    // Check if the document is stored
    const [ownerAddress, storedTimestamp] = await documentVerifier.getDocumentDetails(fileHash);
    expect(ownerAddress).to.equal(addr1.address);
    expect(storedTimestamp).to.be.greaterThan(0); // Ensure timestamp is greater than 0
  });
  
  


  it("Should verify an existing document", async function () {
    const fileHash = "0x123456789abcdef";

    // Upload the document first
    await documentVerifier.connect(addr1).uploadDocument(fileHash);

    // Verify the document
    const tx = await documentVerifier.connect(addr1).verifyDocument(fileHash);
    await expect(tx)
      .to.emit(documentVerifier, "DocumentVerified")
      .withArgs(fileHash, true, addr1.address);
  });

  it("Should return false for a non-existent document when verifying", async function () {
    const fileHash = "0xnonexistenthash";

    // Verify a non-existent document
    const tx = await documentVerifier.connect(addr1).verifyDocument(fileHash);
    await expect(tx)
      .to.emit(documentVerifier, "DocumentVerified")
      .withArgs(fileHash, false, addr1.address);
  });
});
