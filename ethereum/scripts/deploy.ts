import { ethers } from 'hardhat';

async function main() {
    const seaBattle = await ethers.deployContract('SeaBattle');

    await seaBattle.waitForDeployment();

    console.log(`SeaBattle deployed to ${seaBattle.target}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
