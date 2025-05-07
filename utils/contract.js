import { ethers } from "ethers";
import contractABI from "../artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export function getContract() {
    console.log(contractABI);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI.abi, signer);
}
