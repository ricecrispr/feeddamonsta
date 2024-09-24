// Add your contract ABI and contract address here
const contractABI = [/* Your ABI goes here */];
const contractAddress = '0xYourContractAddress'; // Replace with your contract address

let provider;
let signer;
let contract;
let currentLevel = 0; // Initially the egg is at level 0
let monsterName = "Monster Egg"; // Initial monster name
const levelThresholds = [0.01, 0.02, 0.04, 0.08, 0.16, 0.32, 0.6, 1]; // Thresholds in ETH for levels

// Images for different levels of the monster
const monsterImages = [
  'images/egg.jpg',    // Egg stage (Level 0)
  'images/level1.jpg', // Level 1 monster
  'images/level2.jpg', // Level 2 monster
  'images/level3.jpg', // Level 3 monster
  'images/level4.jpg', // Level 4 monster
  'images/level5.jpg', // Level 5 monster
  'images/level6.jpg', // Level 6 monster
  'images/level7.jpg', // Level 7 monster
  'images/level8.jpg'  // Fully hatched monster at Level 8
];

// Function to initialize connection to MetaMask
async function connectWallet() {
  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []); // Request account access
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      document.getElementById('status').textContent = "Wallet Connected!";
      listenForEvents(); // Start listening for contract events
    } catch (error) {
      document.getElementById('status').textContent = "Error connecting wallet: " + error.message;
    }
  } else {
    document.getElementById('status').textContent = "Please install MetaMask!";
  }
}

// Function to contribute ETH
async function contributeETH() {
  const ethAmount = document.getElementById('ethAmount').value;
  if (!ethAmount || ethAmount <= 0) {
    alert("Please enter a valid ETH amount.");
    return;
  }

  try {
    const transaction = await contract.contribute({ value: ethers.utils.parseEther(ethAmount) });
    document.getElementById('status').textContent = "Transaction sent. Waiting for confirmation...";
    await transaction.wait();
    document.getElementById('status').textContent = "Contribution successful!";
  } catch (error) {
    document.getElementById('status').textContent = "Error in transaction: " + error.message;
  }
}

// Function to listen for contract events
function listenForEvents() {
  // Listen for level-up event
  contract.on('LevelUp', (eggId, newLevel) => {
    currentLevel = newLevel.toNumber(); // Update the current level
    updateMonsterImage(currentLevel);
    updateInfo(currentLevel);
    document.getElementById('status').textContent = `Monster leveled up to Level ${currentLevel}!`;
  });

  // Listen for egg hatched event
  contract.on('EggHatched', (eggId) => {
    updateMonsterImage(8); // Display final monster image (Level 8)
    updateInfo(8); // Update info to level 8
    document.getElementById('status').textContent = "The monster has fully hatched!";
  });

  // Listen for new egg event
  contract.on('NewEgg', (eggId) => {
    currentLevel = 0; // Reset to egg state
    updateMonsterImage(0); // Show egg image
    updateInfo(0); // Update info to level 0
    document.getElementById('status').textContent = "A new egg has appeared!";
  });
}

// Function to update the displayed monster image
function updateMonsterImage(level) {
  const imageElement = document.getElementById('egg-image');
  imageElement.src = monsterImages[level]; // Update the image source
}

// Function to update monster info display
function updateInfo(level) {
  // Update the monster name, current level, and next level cost
  document.getElementById('currentLevel').textContent = `Current Level: ${level}`;
  if (level < 8) {
    const nextLevelCost = levelThresholds[level]; // Get the next level cost
    document.getElementById('nextLevelCost').textContent = `Next Level Cost: ${nextLevelCost} ETH`;
  } else {
    document.getElementById('nextLevelCost').textContent = `Next Level Cost: N/A`;
  }
  document.getElementById('monsterName').textContent = `Monster Name: ${monsterName}`;
}

// Event listeners for wallet connection and contribution
document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('contribute').addEventListener('click', contributeETH);
