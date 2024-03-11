// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract SeaBattle {
    address payable public owner;

    uint256 public constant PLAYERS_AMOUNT = 2;
    uint256 public constant SHIPS_CELLS = 20;

    struct Coordinate {
        uint8 x;
        uint8 y;
    }

    bool public gameIsStarted;
    address public activePlayer;
    address[] public playersAddresses;
    mapping(address => mapping(bytes32 => bool)) shipsCells;
    mapping(address => Coordinate[]) shots;
    mapping(address => uint256) public sunkenCellsAmount;

    event GameIsStarted(address[] playersAddresses, address activePlayer);
    event ShotReport(address from, address to, Coordinate coordinate, bool isHit);
    event GameIsFinished(address initiator);

    constructor() {
        owner = payable(msg.sender);
    }

    function startGame(Coordinate[] memory _shipsCells) public {
        require(!gameIsStarted, "Game has already started");
        require(_shipsCells.length == SHIPS_CELLS, "Amount of cells do not match the expected");

        playersAddresses.push(msg.sender);

        for (uint8 i = 0; i < SHIPS_CELLS; i++) {
            bytes32 _cellHash = keccak256(abi.encode(_shipsCells[i]));

            shipsCells[msg.sender][_cellHash] = true;
        }

        if (playersAddresses.length == PLAYERS_AMOUNT) {
            gameIsStarted = true;
            activePlayer = playersAddresses[0];
            emit GameIsStarted(playersAddresses, playersAddresses[0]);
        }
    }

    function takeAShot(Coordinate memory _coordinate) public {
        require(gameIsStarted, "Game has not started");
        require(msg.sender == activePlayer, "Current player is not active");

        address _address0 = playersAddresses[0];
        address _address1 = playersAddresses[1];
        address _anotherPlayer = _address0 == msg.sender ? _address1 : _address0;

        shots[msg.sender].push(_coordinate);
        bytes32 _coordinatesHash = keccak256(abi.encode(_coordinate));

        if (shipsCells[_anotherPlayer][_coordinatesHash]) {
          sunkenCellsAmount[msg.sender]++;
          emit ShotReport(msg.sender, _anotherPlayer, _coordinate, true);
          if (sunkenCellsAmount[msg.sender] == SHIPS_CELLS) finishGame();
        } else {
          activePlayer = _anotherPlayer;
          emit ShotReport(msg.sender, _anotherPlayer, _coordinate, false);
        }
    }

    function finishGame() public {
        require(gameIsStarted, "Game has not started");

        gameIsStarted = false;
        activePlayer = address(0);
        emit GameIsFinished(msg.sender);
    }
}