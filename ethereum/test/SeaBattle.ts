import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SeaBattle', function () {
    async function deploy() {
        const mockShips = [
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 },
            { x: 1, y: 5 },
            { x: 1, y: 6 },
            { x: 1, y: 7 },
            { x: 1, y: 8 },
            { x: 1, y: 9 },
            { x: 1, y: 10 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 4, y: 1 },
            { x: 5, y: 1 },
            { x: 6, y: 1 },
            { x: 7, y: 1 },
            { x: 8, y: 1 },
            { x: 9, y: 1 },
            { x: 10, y: 1 },
            { x: 10, y: 10 }
        ];
        const [owner, anotherPlayer] = await ethers.getSigners();
        const SeaBattle = await ethers.getContractFactory('SeaBattle');
        const seaBattle = await SeaBattle.deploy();

        return { seaBattle, mockShips, owner, anotherPlayer };
    }

    describe('Deployment', function () {
        it('Should set the right owner', async function () {
            const { seaBattle, owner } = await loadFixture(deploy);

            expect(await seaBattle.owner()).to.equal(owner.address);
        });
    });

    describe('Start game', function () {
        it('A game cannot start when amount of cells do not match the expected', async function () {
            const { seaBattle } = await loadFixture(deploy);

            await expect(seaBattle.startGame([{ x: 1, y: 1 }])).to.be.revertedWith(
                'Amount of cells do not match the expected'
            );
        });

        it('A game cannot start when amount of players less than expected', async function () {
            const { seaBattle, mockShips } = await loadFixture(deploy);

            await seaBattle.startGame(mockShips);

            expect(await seaBattle.gameIsStarted()).to.equal(false);
        });

        it('Game has started when amount of players match the expected', async function () {
            const { seaBattle, mockShips, owner, anotherPlayer } = await loadFixture(deploy);

            await seaBattle.startGame(mockShips);
            await seaBattle.connect(anotherPlayer).startGame(mockShips);

            expect(await seaBattle.gameIsStarted()).to.equal(true);
            expect(await seaBattle.activePlayer()).to.equal(owner);
            expect(await seaBattle.playersAddresses(0)).to.equal(owner);
            expect(await seaBattle.playersAddresses(1)).to.equal(anotherPlayer);
        });
    });

    describe('Take a shot', function () {
        it('There is no possible way to take a shot when game has not started', async function () {
            const { seaBattle } = await loadFixture(deploy);

            await expect(seaBattle.takeAShot({ x: 1, y: 1 })).to.be.revertedWith('Game has not started');
        });

        it('There is no possible way to take a shot if player is not active', async function () {
            const { seaBattle, mockShips, anotherPlayer } = await loadFixture(deploy);

            await seaBattle.startGame(mockShips);
            await seaBattle.connect(anotherPlayer).startGame(mockShips);

            await expect(seaBattle.connect(anotherPlayer).takeAShot({ x: 1, y: 1 })).to.be.revertedWith(
                'Current player is not active'
            );
        });

        it('The state will update correctly when active player will miss', async function () {
            const { seaBattle, mockShips, owner, anotherPlayer } = await loadFixture(deploy);

            await seaBattle.startGame(mockShips);
            await seaBattle.connect(anotherPlayer).startGame(mockShips);

            await expect(seaBattle.takeAShot({ x: 5, y: 5 }))
                .to.emit(seaBattle, 'ShotReport')
                .withArgs(owner, anotherPlayer, [5n, 5n], false);
            expect(await seaBattle.sunkenCellsAmount(owner.address)).to.equal(0);
            expect(await seaBattle.activePlayer()).to.equal(anotherPlayer);
        });

        it('The state will update correctly when active player will hit', async function () {
            const { seaBattle, mockShips, owner, anotherPlayer } = await loadFixture(deploy);

            await seaBattle.startGame(mockShips);
            await seaBattle.connect(anotherPlayer).startGame(mockShips);

            await expect(seaBattle.takeAShot({ x: 1, y: 1 }))
                .to.emit(seaBattle, 'ShotReport')
                .withArgs(owner, anotherPlayer, [1n, 1n], true);
            expect(await seaBattle.sunkenCellsAmount(owner.address)).to.equal(1);
            expect(await seaBattle.activePlayer()).to.equal(owner);
            await seaBattle.takeAShot({ x: 10, y: 10 });
            expect(await seaBattle.sunkenCellsAmount(owner.address)).to.equal(2);
        });

        it('A game will finish if another player lost all their ships', async function () {
            const { seaBattle, mockShips, owner, anotherPlayer } = await loadFixture(deploy);

            await seaBattle.startGame(mockShips);
            await seaBattle.connect(anotherPlayer).startGame(mockShips);
            await seaBattle.takeAShot({ x: 1, y: 1 });
            await seaBattle.takeAShot({ x: 1, y: 2 });
            await seaBattle.takeAShot({ x: 1, y: 3 });
            await seaBattle.takeAShot({ x: 1, y: 4 });
            await seaBattle.takeAShot({ x: 1, y: 5 });
            await seaBattle.takeAShot({ x: 1, y: 6 });
            await seaBattle.takeAShot({ x: 1, y: 7 });
            await seaBattle.takeAShot({ x: 1, y: 8 });
            await seaBattle.takeAShot({ x: 1, y: 9 });
            await seaBattle.takeAShot({ x: 1, y: 10 });
            await seaBattle.takeAShot({ x: 2, y: 1 });
            await seaBattle.takeAShot({ x: 3, y: 1 });
            await seaBattle.takeAShot({ x: 4, y: 1 });
            await seaBattle.takeAShot({ x: 5, y: 1 });
            await seaBattle.takeAShot({ x: 6, y: 1 });
            await seaBattle.takeAShot({ x: 7, y: 1 });
            await seaBattle.takeAShot({ x: 8, y: 1 });
            await seaBattle.takeAShot({ x: 9, y: 1 });
            await seaBattle.takeAShot({ x: 10, y: 1 });
            await seaBattle.takeAShot({ x: 10, y: 10 });

            expect(await seaBattle.sunkenCellsAmount(owner.address)).to.equal(20);
            expect(await seaBattle.gameIsStarted()).to.equal(false);
            expect(await seaBattle.activePlayer()).to.equal(ethers.ZeroAddress);
        });
    });

    describe('Finish game', function () {
        it('A game cannot be finished when the game has not started', async function () {
            const { seaBattle } = await loadFixture(deploy);

            await expect(seaBattle.finishGame()).to.be.revertedWith('Game has not started');
        });

        it('A game will be finish correctly', async function () {
            const { seaBattle, mockShips, anotherPlayer } = await loadFixture(deploy);

            await seaBattle.startGame(mockShips);
            await seaBattle.connect(anotherPlayer).startGame(mockShips);

            await expect(seaBattle.finishGame()).to.emit(seaBattle, 'GameIsFinished');
            expect(await seaBattle.gameIsStarted()).to.equal(false);
            expect(await seaBattle.activePlayer()).to.equal(ethers.ZeroAddress);
        });
    });
});
