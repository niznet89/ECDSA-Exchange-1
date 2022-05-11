const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const secp = require('@noble/secp256k1');


// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());


// Defining all the private keys for the project
let privateKey1 = secp.utils.randomPrivateKey();
let privateKey2 = secp.utils.randomPrivateKey();
let privateKey3 = secp.utils.randomPrivateKey();
privateKey1 = Buffer.from(privateKey1).toString('hex');
privateKey2 = Buffer.from(privateKey2).toString('hex');
privateKey3 = Buffer.from(privateKey3).toString('hex');

// Need to hardcode in private keys to test out app
// privateKey1 = "32f42fb5fff6b9239a4b9dceb8bfbe2b53261dd0af6f7dcdc6abbec169bc26df";
// privateKey2 = "ab0ca926b8f5db4c37548975bbce76644f2f8b246760aad60cf41800f29161aa";
// privateKey3 = "dd1f082ee3ddd6869c97a632fda84adbbf91b3362153333cb43873b6db44e6d2";

let privateArray = [privateKey1, privateKey2, privateKey3];
let publicArray = [];

privateArray.forEach(pk => {
  let publicKey = secp.getPublicKey(pk);
  publicKey = Buffer.from(publicKey).toString('hex');
  publicKey = '0x' + publicKey.slice(publicKey.length - 40);
  publicArray.push(publicKey);
})


// console.log(publicKey1);

// publicKey1 = '0x' + publicKey1.slice(publicKey1.length - 40);

// console.log(publicKey1);

const balances = {
  [publicArray[0]]: 100,
  [publicArray[1]]: 50,
  [publicArray[2]]: 75,
}

// Logging to console the available
console.log("AVAILABLE ACCOUNTS");
console.log("==================");
for (let i = 0; i < privateArray.length; i++) {
  console.log(`(${i}) ${publicArray[i]} (${balances[publicArray[i]]}) FedCoin`)
};

console.log("Private Keys");
console.log("========");
for (let i = 0; i < privateArray.length; i++) {
  console.log(`(${i}) ${privateArray[i]}`)
};

////////////

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  (async () => {
    let sendingPrivateKey = secp.getPublicKey(sender);
    console.log(Buffer.from(sendingPrivateKey).toString('hex'));
    let messageHash = await secp.utils.sha256(amount);
    console.log(messageHash);
    let signature = await secp.sign(messageHash, sender);
    const isValid = secp.verify(signature, messageHash, sendingPrivateKey);
    console.log(isValid);
    if (isValid) {
      const indexOfSender = privateArray.indexOf(sender);
    console.log(indexOfSender);
    balances[publicArray[indexOfSender]] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[publicArray[indexOfSender]] });
    }
  })();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
