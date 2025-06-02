const provider = new ethers.providers.Web3Provider(window.ethereum, "sepolia");
const contractAddress = "0x9dd17778B290f744cC37E1b7Bb5F7fB861075950";
const abi = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

let signer;
let contract;

const connectBtn = document.getElementById("connectBtn");
const walletInfo = document.getElementById("walletInfo");
const addressSpan = document.getElementById("address");
const balanceSpan = document.getElementById("balance");
const usdValueSpan = document.getElementById("usdValue");
const recipientInput = document.getElementById("recipient");
const amountInput = document.getElementById("amount");
const sendBtn = document.getElementById("sendBtn");
const statusP = document.getElementById("status");

async function connectWallet() {
  if (!window.ethereum) {
    alert("Veuillez installer Metamask !");
    return;
  }
  try {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
    const address = await signer.getAddress();
    addressSpan.textContent = address;
    walletInfo.style.display = "block";
    connectBtn.style.display = "none";
    await updateBalance();
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la connexion au wallet.");
  }
}

async function updateBalance() {
  try {
    const address = await signer.getAddress();
    let balance = await contract.balanceOf(address);
    balance = ethers.utils.formatUnits(balance, 18);
    balanceSpan.textContent = balance;
    usdValueSpan.textContent = balance;
  } catch (error) {
    console.error(error);
  }
}

async function sendMTK() {
  const to = recipientInput.value.trim();
  const amount = amountInput.value.trim();
  if (!ethers.utils.isAddress(to)) {
    alert("Adresse destinataire invalide");
    return;
  }
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("Montant invalide");
    return;
  }
  try {
    const amountWei = ethers.utils.parseUnits(amount, 18);
    statusP.textContent = "Transaction en cours...";
    const tx = await contract.transfer(to, amountWei);
    await tx.wait();
    statusP.textContent = "Transaction envoyée avec succès !";
    recipientInput.value = "";
    amountInput.value = "";
    await updateBalance();
  } catch (error) {
    console.error(error);
    statusP.textContent = "Erreur lors de l'envoi de la transaction.";
  }
}

connectBtn.onclick = connectWallet;
sendBtn.onclick = sendMTK;
