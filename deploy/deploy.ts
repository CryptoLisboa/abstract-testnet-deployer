import * as fs from "fs";
import * as path from "path";

import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-ethers";

const DEPLOYMENT_DELAY = 2000; // 2 seconds delay between deployments

function formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(',', '');
}

async function verifyContract(hre: HardhatRuntimeEnvironment, address: string, constructorArgs: any[]) {
    console.log(`Starting verification for contract at ${address}...`);

    try {
        await hre.run("verify:verify", {
            address: address,
            contract: "contracts/HelloAbstract.sol:HelloAbstract",
            constructorArguments: constructorArgs,
            bytecodeHash: "bytes",
        });
        console.log(`Contract at ${address} verified successfully!`);
        return { status: "success", address };
    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log(`Contract at ${address} already verified!`);
            return { status: "already-verified", address };
        }
        console.error(`Error verifying contract at ${address}:`, error);
        try {
            console.log(`Attempting alternative verification for ${address}...`);
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: constructorArgs,
            });
            console.log(`Contract at ${address} verified successfully with alternative method!`);
            return { status: "success-alternative", address };
        } catch (altError: any) {
            console.error(`Alternative verification failed for ${address}:`, altError);
            return { status: "failed", address, error: altError.message };
        }
    }
}

async function saveDeploymentInfo(hre: HardhatRuntimeEnvironment, info: any) {
    const deploymentsDir = "deployments";
    const networkDir = path.join(deploymentsDir, hre.network.name);

    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    if (!fs.existsSync(networkDir)) {
        fs.mkdirSync(networkDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const historicalFilePath = path.join(networkDir, `deployment-${timestamp}.json`);
    fs.writeFileSync(historicalFilePath, JSON.stringify(info, null, 2));
    console.log(`Historical deployment info saved to: ${historicalFilePath}`);

    const latestFilePath = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
    fs.writeFileSync(latestFilePath, JSON.stringify(info, null, 2));
    console.log(`Latest deployment info updated at: ${latestFilePath}`);
}

async function deployContract(hre: HardhatRuntimeEnvironment, wallet: Wallet, index: number) {
    console.log(`Starting deployment #${index + 1}...`);

    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact("HelloAbstract");

    const deploymentDate = formatDate(new Date());
    const constructorArgs = [index, deploymentDate];

    const deploymentFee = await deployer.estimateDeployFee(artifact, constructorArgs);
    const parsedFee = hre.ethers.formatEther(deploymentFee.toString());
    console.log(`Estimated deployment fee for #${index + 1}: ${parsedFee} ETH`);

    const contract = await deployer.deploy(artifact, constructorArgs);
    const receipt = await contract.deploymentTransaction()?.wait();
    const contractAddress = await contract.getAddress();

    console.log(`Contract #${index + 1} deployed to: ${contractAddress}`);

    return {
        index: index + 1,
        network: hre.network.name,
        contractAddress,
        deploymentFee: parsedFee,
        gasUsed: receipt?.gasUsed.toString(),
        status: receipt?.status === 1 ? "success" : "failed",
        timestamp: new Date().toISOString(),
        deploymentDate,
        contractName: "HelloAbstract",
        constructorArgs,
        compiler: {
            solidity: hre.config.solidity.version,
        },
    };
}

export default async function (hre: HardhatRuntimeEnvironment) {
    const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
    const CONTRACT_COUNT = parseInt(process.env.CONTRACT_COUNT || "1");

    if (!PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY is required in .env file");
    }

    console.log(`Starting deployment process for ${CONTRACT_COUNT} contracts...`);

    const wallet = new Wallet(PRIVATE_KEY);

    // Clean and compile before deployments
    await hre.run("clean");
    await hre.run("compile");

    // Deploy contracts sequentially with delays
    console.log("Deploying contracts sequentially...");
    const deploymentResults = [];
    
    for (let i = 0; i < CONTRACT_COUNT; i++) {
        if (i > 0) {
            console.log(`Waiting ${DEPLOYMENT_DELAY}ms before next deployment...`);
            await new Promise((resolve) => setTimeout(resolve, DEPLOYMENT_DELAY));
        }
        const result = await deployContract(hre, wallet, i);
        deploymentResults.push(result);
    }

    // Save all deployment information
    await saveDeploymentInfo(hre, {
        batchSize: CONTRACT_COUNT,
        deployments: deploymentResults,
        timestamp: new Date().toISOString(),
    });

    // Wait before starting verifications
    console.log("Waiting 60 seconds before starting verifications...");
    await new Promise((resolve) => setTimeout(resolve, 60000));

    // Verify all contracts in parallel (verification can be parallel)
    console.log("Starting parallel contract verifications...");
    const verificationPromises = deploymentResults.map((result) => 
        verifyContract(hre, result.contractAddress, result.constructorArgs)
    );

    const verificationResults = await Promise.all(verificationPromises);

    // Log final summary
    console.log("\nDeployment Summary:");
    deploymentResults.forEach((result, i) => {
        console.log(`\nContract #${i + 1}:`);
        console.log(`Address: ${result.contractAddress}`);
        console.log(`Status: ${result.status}`);
        console.log(`Gas Used: ${result.gasUsed}`);
        console.log(`Deployment Date: ${result.deploymentDate}`);
        console.log(`Verification: ${verificationResults[i].status}`);
    });
}
