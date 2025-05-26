const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Deploy the contract
  const DocumentVerifier = await hre.ethers.getContractFactory("DocumentVerifier");
  const documentVerifier = await DocumentVerifier.deploy();
  await documentVerifier.deployed();

  const address = documentVerifier.address;
  console.log("✅ DocumentVerifier deployed to:", address);

  // Prepare .env.local content
  const envPath = path.resolve(__dirname, "..", ".env.local");
  const envLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`;

  try {
    fs.writeFileSync(envPath, envLine, { encoding: "utf-8" });
    console.log("✅ .env.local updated successfully.");
  } catch (err) {
    console.error("❌ Failed to write to .env.local:", err);
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
