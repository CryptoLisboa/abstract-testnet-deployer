import * as fs from "fs";
import * as path from "path";

import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-ethers";

async function verifyContract(hre: HardhatRuntimeEnvironment, address: string) {
    console.log("Starting contract verification...");

    // Wait longer for the transaction to be mined and the contract to be ready
    console.log("Waiting for contract to be ready for verification...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // 60 seconds delay

    try {
        await hre.run("verify:verify", {
            address: address,
            contract: "contracts/HelloAbstract.sol:HelloAbstract",
            constructorArguments: [], // Add constructor arguments if your contract has any
            bytecodeHash: "bytes", // This is specific to zkSync Era
        });
        console.log("Contract verified successfully!");
    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Contract already verified!");
        } else {
            console.error("Error verifying contract:", error);
            // Try alternative verification method
            try {
                console.log("Attempting alternative verification method...");
                await hre.run("verify:verify", {
                    address: address,
                    constructorArguments: [],
                });
                console.log("Contract verified successfully with alternative method!");
            } catch (altError: any) {
                console.error("Alternative verification also failed:", altError);
            }
        }
    }
}

async function saveDeploymentInfo(hre: HardhatRuntimeEnvironment, info: any) {
    // Create deployments directory if it doesn't exist
    const deploymentsDir = "deployments";
    const networkDir = path.join(deploymentsDir, hre.network.name);
    
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    if (!fs.existsSync(networkDir)) {
        fs.mkdirSync(networkDir);
    }

    // Save historical deployment with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const historicalFilePath = path.join(networkDir, `deployment-${timestamp}.json`);
    fs.writeFileSync(historicalFilePath, JSON.stringify(info, null, 2));
    console.log(`Historical deployment info saved to: ${historicalFilePath}`);

    // Update latest deployment file
    const latestFilePath = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
    fs.writeFileSync(latestFilePath, JSON.stringify(info, null, 2));
    console.log(`Latest deployment info updated at: ${latestFilePath}`);
}

export default async function (hre: HardhatRuntimeEnvironment) {
    const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
    if (!PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY is required in .env file");
    }

    console.log("Starting deployment process...");

    const wallet = new Wallet(PRIVATE_KEY);
    const deployer = new Deployer(hre, wallet);

    // Clean artifacts before compilation
    await hre.run("clean");
    // Compile contracts
    await hre.run("compile");

    const artifact = await deployer.loadArtifact("HelloAbstract");

    console.log("Deploying HelloAbstract contract...");
    const deploymentFee = await deployer.estimateDeployFee(artifact, []);
    
    console.log(`Estimated deployment fee: ${deploymentFee} ETH`);
    
    const parsedFee = hre.ethers.formatEther(deploymentFee.toString());
    console.log(`Estimated deployment fee: ${parsedFee} ETH`);

    const contract = await deployer.deploy(artifact);

    // Wait for the deployment transaction to be included in a block
    const receipt = await contract.deploymentTransaction()?.wait();
    
    console.log(`Deployment status: ${receipt?.status === 1 ? 'success' : 'failed'}`);
    console.log(`Gas used: ${receipt?.gasUsed.toString()}`);
    
    const contractAddress = await contract.getAddress();
    console.log(`Contract deployed to: ${contractAddress}`);

    // Prepare deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress,
        deploymentFee: parsedFee,
        gasUsed: receipt?.gasUsed.toString(),
        status: receipt?.status === 1 ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
        contractName: "HelloAbstract",
        compiler: {
            solidity: hre.config.solidity.compilers?.[0]?.version,
        }
    };

    // Save deployment information
    await saveDeploymentInfo(hre, deploymentInfo);

    // Verify the contract
    await verifyContract(hre, contractAddress);
}
